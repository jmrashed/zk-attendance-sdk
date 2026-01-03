import dgram from 'node:dgram';
import { COMMANDS, MAX_CHUNK, REQUEST_DATA } from '../constants/command';
import { log } from '../logs/log';
import { decode as decodeDeviceTimestamp } from './time';
import {
  createUDPHeader,
  decodeRecordData16,
  decodeRecordRealTimeLog18,
  decodeUDPHeader,
  decodeUserData28,
  exportErrorMessage,
  isEventUDP,
} from './utils';

type ErrorCallback = (error: Error) => void;
type CloseCallback = (protocol: 'udp') => void;
type ChunkProgressCallback = (
  receivedBytes: number,
  totalBytes: number,
) => void;
type RealTimeLogCallback = (
  log: ReturnType<typeof decodeRecordRealTimeLog18>,
) => void;

type CommandValue = (typeof COMMANDS)[keyof typeof COMMANDS];

interface ReadWithBufferResult {
  data: Buffer;
  err: Error | null;
  mode?: number;
}

type UserRecord = ReturnType<typeof decodeUserData28>;
type AttendanceRecord = ReturnType<typeof decodeRecordData16> & { ip: string };

class JUDP {
  private socket: dgram.Socket | null = null;
  private sessionId: number | null = null;
  private replyId = 0;
  private isRealtimeListening = false;

  constructor(
    private readonly ip: string,
    private readonly port: number,
    private readonly timeout: number | undefined,
    private readonly inboundPort: number,
  ) {}

  createSocket(
    cbError?: ErrorCallback,
    cbClose?: CloseCallback,
  ): Promise<dgram.Socket> {
    return new Promise<dgram.Socket>((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      socket.setMaxListeners(0);
      this.socket = socket;

      socket.once('error', err => {
        cbError?.(err);
        reject(err);
      });

      socket.on('close', () => {
        this.socket = null;
        cbClose?.('udp');
      });

      socket.once('listening', () => {
        resolve(socket);
      });

      try {
        socket.bind(this.inboundPort);
      } catch (err) {
        socket.removeAllListeners();
        cbError?.(err as Error);
        reject(err as Error);
      }
    });
  }

  async connect(): Promise<boolean> {
    const reply = await this.executeCmd(COMMANDS.CMD_CONNECT, Buffer.alloc(0));
    return Boolean(reply);
  }

  async closeSocket(): Promise<boolean> {
    const socket = this.socket;
    if (!socket) {
      return true;
    }

    return new Promise<boolean>(resolve => {
      const timer = setTimeout(() => {
        resolve(true);
      }, 2000);

      socket.removeAllListeners('message');
      socket.close(() => {
        clearTimeout(timer);
        this.socket = null;
        resolve(true);
      });
    });
  }

  private ensureSocket(): dgram.Socket {
    if (!this.socket) {
      throw new Error('Socket is not initialized. Call createSocket() first.');
    }
    return this.socket;
  }

  executeCmd(command: number, data: Buffer | string): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
      if (command === COMMANDS.CMD_CONNECT) {
        this.sessionId = 0;
        this.replyId = 0;
      } else {
        this.replyId += 1;
      }

      const buffer = createUDPHeader(
        command as CommandValue,
        this.sessionId ?? 0,
        this.replyId,
        data,
      );

      try {
        const reply = await this.writeMessage(
          buffer,
          command === COMMANDS.CMD_CONNECT || command === COMMANDS.CMD_EXIT,
        );

        if (reply.length && command === COMMANDS.CMD_CONNECT) {
          this.sessionId = reply.readUInt16LE(4);
        }

        resolve(reply);
      } catch (err) {
        reject(err);
      }
    });
  }

  writeMessage(msg: Buffer, connect: boolean): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer: NodeJS.Timeout | null = null;

      const handleMessage = (data: Buffer) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener('message', handleMessage);
        resolve(data);
      };

      socket.once('message', handleMessage);

      socket.send(msg, 0, msg.length, this.port, this.ip, err => {
        if (err) {
          socket.removeListener('message', handleMessage);
          reject(err);
          return;
        }

        if (this.timeout) {
          timer = setTimeout(
            () => {
              if (timer) {
                clearTimeout(timer);
              }
              socket.removeListener('message', handleMessage);
              reject(new Error('TIMEOUT_ON_WRITING_MESSAGE'));
            },
            connect ? 2000 : this.timeout,
          );
        }
      });
    });
  }

  requestData(msg: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer: NodeJS.Timeout | null = null;
      const requestTimeout = Math.max(this.timeout ?? 0, 10000);

      const internalCallback = (data: Buffer) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener('message', handleOnData);
        resolve(data);
      };

      const handleOnData = (data: Buffer) => {
        if (isEventUDP(data)) {
          return;
        }

        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          socket.removeListener('message', handleOnData);
          reject(new Error('TIMEOUT_ON_RECEIVING_REQUEST_DATA'));
        }, requestTimeout);

        if (data.length >= 13) {
          internalCallback(data);
        }
      };

      socket.on('message', handleOnData);

      socket.send(msg, 0, msg.length, this.port, this.ip, err => {
        if (err) {
          socket.removeListener('message', handleOnData);
          reject(err);
          return;
        }

        timer = setTimeout(() => {
          socket.removeListener('message', handleOnData);
          reject(
            new Error('TIMEOUT_IN_RECEIVING_RESPONSE_AFTER_REQUESTING_DATA'),
          );
        }, requestTimeout);
      });
    });
  }

  sendChunkRequest(start: number, size: number): void {
    this.replyId += 1;
    const reqData = Buffer.alloc(8);
    reqData.writeUInt32LE(start, 0);
    reqData.writeUInt32LE(size, 4);
    const buffer = createUDPHeader(
      COMMANDS.CMD_DATA_RDY,
      this.sessionId ?? 0,
      this.replyId,
      reqData,
    );

    const socket = this.ensureSocket();
    socket.send(buffer, 0, buffer.length, this.port, this.ip, err => {
      if (err) {
        log(`[UDP][SEND_CHUNK_REQUEST] ${err.toString()}`);
      }
    });
  }

  readWithBuffer(
    reqData: Buffer,
    cb: ChunkProgressCallback | null = null,
  ): Promise<ReadWithBufferResult> {
    return new Promise<ReadWithBufferResult>(async (resolve, reject) => {
      this.replyId += 1;
      const buffer = createUDPHeader(
        COMMANDS.CMD_DATA_WRRQ,
        this.sessionId ?? 0,
        this.replyId,
        reqData,
      );

      let reply: Buffer;

      try {
        reply = await this.requestData(buffer);
      } catch (err) {
        reject(err);
        return;
      }

      const header = decodeUDPHeader(reply.subarray(0, 8));

      switch (header.commandId) {
        case COMMANDS.CMD_DATA: {
          resolve({ data: reply.subarray(8), mode: 8, err: null });
          break;
        }

        case COMMANDS.CMD_ACK_OK:
        case COMMANDS.CMD_PREPARE_DATA: {
          const recvData = reply.subarray(8);
          const size = recvData.readUIntLE(1, 4);

          const remain = size % MAX_CHUNK;
          const numberChunks = Math.floor((size - remain) / MAX_CHUNK);

          let totalBuffer = Buffer.alloc(0);

          const socket = this.ensureSocket();
          const timeout = 3000;
          let timer: NodeJS.Timeout | null = null;

          const resetTimer = (cb: () => void, ms = timeout) => {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(cb, ms);
          };

          const internalCallback = (data: Buffer, err: Error | null = null) => {
            if (timer) {
              clearTimeout(timer);
            }
            socket.removeListener('message', handleOnData);
            resolve({ data, err });
          };

          resetTimer(() => {
            internalCallback(
              totalBuffer,
              new Error('TIMEOUT WHEN RECEIVING PACKET'),
            );
          });

          const handleOnData = (incoming: Buffer) => {
            if (isEventUDP(incoming)) {
              return;
            }

            resetTimer(() => {
              internalCallback(
                totalBuffer,
                new Error(
                  `TIMEOUT !! ${(size - totalBuffer.length) / size} % REMAIN !`,
                ),
              );
            });

            const incomingHeader = decodeUDPHeader(incoming);

            switch (incomingHeader.commandId) {
              case COMMANDS.CMD_PREPARE_DATA: {
                break;
              }

              case COMMANDS.CMD_DATA: {
                totalBuffer = Buffer.concat([
                  totalBuffer,
                  incoming.subarray(8),
                ]);
                cb?.(totalBuffer.length, size);
                break;
              }

              case COMMANDS.CMD_ACK_OK: {
                if (totalBuffer.length === size) {
                  internalCallback(totalBuffer);
                }
                break;
              }

              default: {
                internalCallback(
                  Buffer.alloc(0),
                  new Error(
                    `ERROR_IN_UNHANDLE_CMD ${exportErrorMessage(
                      incomingHeader.commandId,
                    )}`,
                  ),
                );
              }
            }
          };

          socket.on('message', handleOnData);

          for (let i = 0; i <= numberChunks; i += 1) {
            if (i === numberChunks) {
              this.sendChunkRequest(numberChunks * MAX_CHUNK, remain);
            } else {
              this.sendChunkRequest(i * MAX_CHUNK, MAX_CHUNK);
            }
          }

          break;
        }

        default: {
          reject(
            new Error(
              `ERROR_IN_UNHANDLE_CMD ${exportErrorMessage(header.commandId)}`,
            ),
          );
        }
      }
    });
  }

  async getUsers(): Promise<{ data: UserRecord[]; err: Error | null }> {
    if (this.socket) {
      await this.freeData();
    }

    const response = await this.readWithBuffer(REQUEST_DATA.GET_USERS);

    if (this.socket) {
      await this.freeData();
    }

    const USER_PACKET_SIZE = 28;
    let userData = response.data.subarray(4);
    const users: UserRecord[] = [];

    while (userData.length >= USER_PACKET_SIZE) {
      const user = decodeUserData28(userData.subarray(0, USER_PACKET_SIZE));
      users.push(user);
      userData = userData.subarray(USER_PACKET_SIZE);
    }

    return { data: users, err: response.err };
  }

  async getAttendances(
    callbackInProcess: ChunkProgressCallback = () => {},
  ): Promise<{ data: AttendanceRecord[]; err: Error | null }> {
    if (this.socket) {
      await this.freeData();
    }

    const response = await this.readWithBuffer(
      REQUEST_DATA.GET_ATTENDANCE_LOGS,
      callbackInProcess,
    );

    if (this.socket) {
      await this.freeData();
    }

    const RECORD_PACKET_SIZE = response.mode ? 8 : 16;
    let recordData = response.data.subarray(4);
    const records: AttendanceRecord[] = [];

    while (recordData.length >= RECORD_PACKET_SIZE) {
      const record = decodeRecordData16(
        recordData.subarray(0, RECORD_PACKET_SIZE),
      );
      records.push({ ...record, ip: this.ip });
      recordData = recordData.subarray(RECORD_PACKET_SIZE);
    }

    return { data: records, err: response.err };
  }

  async freeData(): Promise<Buffer> {
    return this.executeCmd(COMMANDS.CMD_FREE_DATA, Buffer.alloc(0));
  }

  async getInfo(): Promise<{
    userCounts: number;
    logCounts: number;
    logCapacity: number;
  }> {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0),
    );

    return {
      userCounts: data.readUIntLE(24, 4),
      logCounts: data.readUIntLE(40, 4),
      logCapacity: data.readUIntLE(72, 4),
    };
  }

  async getTime(): Promise<Date> {
    const data = await this.executeCmd(COMMANDS.CMD_GET_TIME, Buffer.alloc(0));
    return decodeDeviceTimestamp(data.readUInt32LE(8));
  }

  async clearAttendanceLog(): Promise<Buffer> {
    return this.executeCmd(COMMANDS.CMD_CLEAR_ATTLOG, Buffer.alloc(0));
  }

  async disableDevice(): Promise<Buffer> {
    return this.executeCmd(
      COMMANDS.CMD_DISABLEDEVICE,
      REQUEST_DATA.DISABLE_DEVICE,
    );
  }

  async enableDevice(): Promise<Buffer> {
    return this.executeCmd(COMMANDS.CMD_ENABLEDEVICE, Buffer.alloc(0));
  }

  async disconnect(): Promise<boolean> {
    try {
      await this.executeCmd(COMMANDS.CMD_EXIT, Buffer.alloc(0));
    } catch (err) {
      log(
        `[UDP][DISCONNECT] ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return this.closeSocket();
  }

  async getSerialNumber(): Promise<string> {
    const keyword = '~SerialNumber';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('utf-8').replace(`${keyword}=`, '');
  }

  async getDeviceVersion(): Promise<string> {
    const keyword = '~ZKFPVersion';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getDeviceName(): Promise<string> {
    const keyword = '~DeviceName';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getPlatform(): Promise<string> {
    const keyword = '~Platform';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getOS(): Promise<string> {
    const keyword = '~OS';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getWorkCode(): Promise<string> {
    const keyword = 'WorkCode';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getPIN(): Promise<string> {
    const keyword = '~PIN2Width';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getFaceOn(): Promise<'Yes' | 'No'> {
    const keyword = 'FaceFunOn';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    const value = data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
    return value.includes('0') ? 'No' : 'Yes';
  }

  async getSSR(): Promise<string> {
    const keyword = '~SSR';
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString('ascii').replace(`${keyword}=`, '');
  }

  async getFirmware(): Promise<string> {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_VERSION,
      Buffer.alloc(0),
    );
    return data.subarray(8).toString('ascii');
  }

  async setUser(
    uid: number,
    userId: string,
    name: string,
    password: string,
    role = 0,
    cardNo: number | string = 0,
  ): Promise<Buffer | false> {
    const cardNoStr = String(cardNo);

    if (
      Number.isNaN(Number(uid)) ||
      uid <= 0 ||
      uid > 3000 ||
      userId.length > 9 ||
      name.length > 24 ||
      password.length > 8 ||
      cardNoStr.length > 10
    ) {
      return false;
    }

    const commandBuffer = Buffer.alloc(72);
    commandBuffer.writeUInt16LE(uid, 0);
    commandBuffer.writeUInt16LE(role, 2);
    commandBuffer.write(password, 3, 8);
    commandBuffer.write(name, 11, 24);
    commandBuffer.writeUInt16LE(Number(cardNoStr) || 0, 35);
    commandBuffer.writeUInt32LE(0, 40);
    commandBuffer.write(userId ?? '', 48);

    return this.executeCmd(COMMANDS.CMD_USER_WRQ, commandBuffer);
  }

  async getAttendanceSize(): Promise<number> {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0),
    );
    return data.readUIntLE(40, 4);
  }

  async getRealTimeLogs(cb: RealTimeLogCallback = () => {}): Promise<void> {
    this.replyId += 1;

    const buffer = createUDPHeader(
      COMMANDS.CMD_REG_EVENT,
      this.sessionId ?? 0,
      this.replyId,
      REQUEST_DATA.GET_REAL_TIME_EVENT,
    );

    const socket = this.ensureSocket();

    await new Promise<void>((resolve, reject) => {
      socket.send(buffer, 0, buffer.length, this.port, this.ip, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    if (this.isRealtimeListening) {
      return;
    }

    this.isRealtimeListening = true;

    const handleMessage = (data: Buffer) => {
      if (!isEventUDP(data) || data.length < 16) {
        return;
      }

      const header = decodeUDPHeader(data.subarray(0, 8));
      this.sessionId = header.sessionId;

      const ack = createUDPHeader(
        COMMANDS.CMD_ACK_OK,
        header.sessionId,
        header.replyId,
        Buffer.alloc(4),
      );

      socket.send(ack, 0, ack.length, this.port, this.ip, err => {
        if (err) {
          log(`[UDP][ACK_EVENT] ${err.message}`);
        }
      });

      cb(decodeRecordRealTimeLog18(data));
    };

    socket.on('message', handleMessage);
    socket.once('close', () => {
      this.isRealtimeListening = false;
    });
  }

  getSocketStatus(): boolean {
    return this.socket !== null;
  }
}

export default JUDP;
