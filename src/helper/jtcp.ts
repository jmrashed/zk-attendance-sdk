import net from 'node:net';
import { COMMANDS, MAX_CHUNK, REQUEST_DATA } from '../constants/command';
import { log } from '../logs/log';
import { decode as decodeDeviceTimestamp } from './time';
import {
  createTCPHeader,
  decodeRecordData40,
  decodeRecordRealTimeLog52,
  decodeTCPHeader,
  decodeUserData72,
  exportErrorMessage,
  isEventTCP,
  removeTcpHeader,
} from './utils';

type ErrorCallback = (error: Error) => void;
type CloseCallback = (protocol: 'tcp') => void;
type ChunkProgressCallback = (
  receivedBytes: number,
  totalBytes: number,
) => void;
type RealTimeLogCallback = (
  log: ReturnType<typeof decodeRecordRealTimeLog52>,
) => void;

type CommandValue = (typeof COMMANDS)[keyof typeof COMMANDS];

interface ReadWithBufferResult {
  data: Buffer;
  err?: Error | null;
  mode?: number;
}

type UserRecord = ReturnType<typeof decodeUserData72>;
type AttendanceRecord = ReturnType<typeof decodeRecordData40> & { ip: string };

class JTCP {
  private sessionId: number | null = null;
  private replyId = 0;
  private socket: net.Socket | null = null;
  private isRealtimeListening = false;

  constructor(
    private readonly ip: string,
    private readonly port: number,
    private readonly timeout?: number,
  ) {}

  createSocket(
    cbError?: ErrorCallback,
    cbClose?: CloseCallback,
  ): Promise<net.Socket> {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = new net.Socket();
      this.socket = socket;

      socket.once('error', (err: Error) => {
        reject(err);
        cbError?.(err);
      });

      socket.once('connect', () => {
        resolve(socket);
      });

      socket.once('close', () => {
        this.socket = null;
        cbClose?.('tcp');
      });

      if (this.timeout) {
        socket.setTimeout(this.timeout);
      }

      socket.connect(this.port, this.ip);
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

      socket.removeAllListeners('data');
      socket.end(() => {
        clearTimeout(timer);
        this.socket = null;
        resolve(true);
      });
    });
  }

  private ensureSocket(): net.Socket {
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

      const session = this.sessionId ?? 0;
      const buffer = createTCPHeader(
        command as CommandValue,
        session,
        this.replyId,
        data,
      );

      try {
        const reply = await this.writeMessage(
          buffer,
          command === COMMANDS.CMD_CONNECT || command === COMMANDS.CMD_EXIT,
        );

        const sanitizedReply = removeTcpHeader(reply);
        if (sanitizedReply.length && command === COMMANDS.CMD_CONNECT) {
          this.sessionId = sanitizedReply.readUInt16LE(4);
        }

        resolve(sanitizedReply);
      } catch (err) {
        reject(err);
      }
    });
  }

  writeMessage(msg: Buffer, connect: boolean): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer: NodeJS.Timeout | null = null;

      const handleData = (data: Buffer) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener('data', handleData);
        resolve(data);
      };

      socket.once('data', handleData);

      socket.write(msg, err => {
        if (err) {
          socket.removeListener('data', handleData);
          reject(err);
          return;
        }

        if (this.timeout) {
          timer = setTimeout(
            () => {
              if (timer) {
                clearTimeout(timer);
              }
              socket.removeListener('data', handleData);
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
      let replyBuffer = Buffer.alloc(0);
      const requestTimeout = Math.max(this.timeout ?? 0, 10000);

      const internalCallback = (data: Buffer) => {
        socket.removeListener('data', handleOnData);
        if (timer) {
          clearTimeout(timer);
        }
        resolve(data);
      };

      const handleOnData = (data: Buffer) => {
        replyBuffer = Buffer.concat([replyBuffer, data]);
        if (isEventTCP(data)) return;

        if (timer) {
          clearTimeout(timer);
        }

        const header = decodeTCPHeader(replyBuffer.subarray(0, 16));

        if (header.commandId === COMMANDS.CMD_DATA) {
          timer = setTimeout(() => {
            internalCallback(replyBuffer);
          }, 1000);
          return;
        }

        timer = setTimeout(() => {
          socket.removeListener('data', handleOnData);
          reject(new Error('TIMEOUT_ON_RECEIVING_REQUEST_DATA'));
        }, requestTimeout);

        const packetLength = data.readUIntLE(4, 2);
        if (packetLength > 8) {
          internalCallback(data);
        }
      };

      socket.on('data', handleOnData);

      socket.write(msg, err => {
        if (err) {
          socket.removeListener('data', handleOnData);
          reject(err);
          return;
        }

        timer = setTimeout(() => {
          socket.removeListener('data', handleOnData);
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
    const buffer = createTCPHeader(
      COMMANDS.CMD_DATA_RDY,
      this.sessionId ?? 0,
      this.replyId,
      reqData,
    );

    const socket = this.ensureSocket();
    socket.write(buffer, err => {
      if (err) {
        log(`[TCP][SEND_CHUNK_REQUEST] ${err.toString()}`);
      }
    });
  }

  readWithBuffer(
    reqData: Buffer,
    cb?: ChunkProgressCallback,
  ): Promise<ReadWithBufferResult> {
    return new Promise<ReadWithBufferResult>(async (resolve, reject) => {
      this.replyId += 1;
      const buffer = createTCPHeader(
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

      const header = decodeTCPHeader(reply.subarray(0, 16));

      switch (header.commandId) {
        case COMMANDS.CMD_DATA: {
          resolve({ data: reply.subarray(16), mode: 8 });
          break;
        }

        case COMMANDS.CMD_ACK_OK:
        case COMMANDS.CMD_PREPARE_DATA: {
          const recvData = reply.subarray(16);
          const size = recvData.readUIntLE(1, 4);

          const remain = size % MAX_CHUNK;
          const numberChunks = Math.floor((size - remain) / MAX_CHUNK);
          let totalPackets = numberChunks + (remain > 0 ? 1 : 0);
          let replyData = Buffer.alloc(0);

          let totalBuffer = Buffer.alloc(0);
          let realTotalBuffer = Buffer.alloc(0);

          const socket = this.ensureSocket();
          const timeout = 10000;
          let timer: NodeJS.Timeout | null = setTimeout(() => {
            internalCallback(
              replyData,
              new Error('TIMEOUT WHEN RECEIVING PACKET'),
            );
          }, timeout);

          const internalCallback = (data: Buffer, err: Error | null = null) => {
            if (timer) {
              clearTimeout(timer);
            }
            socket.removeListener('data', handleOnData);
            resolve({ data, err });
          };

          const handleOnData = (incoming: Buffer) => {
            if (isEventTCP(incoming)) {
              return;
            }

            if (timer) {
              clearTimeout(timer);
            }

            timer = setTimeout(() => {
              internalCallback(
                replyData,
                new Error(`TIME OUT !! ${totalPackets} PACKETS REMAIN !`),
              );
            }, timeout);

            totalBuffer = Buffer.concat([totalBuffer, incoming]);
            const packetLength = totalBuffer.readUIntLE(4, 2);

            if (totalBuffer.length >= 8 + packetLength) {
              realTotalBuffer = Buffer.concat([
                realTotalBuffer,
                totalBuffer.subarray(16, 8 + packetLength),
              ]);
              totalBuffer = totalBuffer.subarray(8 + packetLength);

              const fullChunkLength = MAX_CHUNK + 8;
              const finalChunkLength = remain + 8;

              if (
                (totalPackets > 1 &&
                  realTotalBuffer.length === fullChunkLength) ||
                (totalPackets === 1 &&
                  realTotalBuffer.length === finalChunkLength)
              ) {
                replyData = Buffer.concat([
                  replyData,
                  realTotalBuffer.subarray(8),
                ]);
                totalBuffer = Buffer.alloc(0);
                realTotalBuffer = Buffer.alloc(0);

                totalPackets -= 1;
                cb?.(replyData.length, size);

                if (totalPackets <= 0) {
                  internalCallback(replyData);
                }
              }
            }
          };

          socket.once('close', () => {
            internalCallback(
              replyData,
              new Error('Socket is disconnected unexpectedly'),
            );
          });

          socket.on('data', handleOnData);

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

  async getSmallAttendanceLogs(): Promise<void> {
    return Promise.resolve();
  }

  async getUsers(): Promise<{ data: UserRecord[] }> {
    if (this.socket) {
      await this.freeData();
    }

    const response = await this.readWithBuffer(REQUEST_DATA.GET_USERS);

    if (this.socket) {
      await this.freeData();
    }

    const USER_PACKET_SIZE = 72;
    let userData = response.data.subarray(4);
    const users: UserRecord[] = [];

    while (userData.length >= USER_PACKET_SIZE) {
      const user = decodeUserData72(userData.subarray(0, USER_PACKET_SIZE));
      users.push(user);
      userData = userData.subarray(USER_PACKET_SIZE);
    }

    return { data: users };
  }

  async getAttendances(
    callbackInProcess: ChunkProgressCallback = () => {},
  ): Promise<{ data: AttendanceRecord[] }> {
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

    const RECORD_PACKET_SIZE = 40;
    let recordData = response.data.subarray(4);
    const records: AttendanceRecord[] = [];

    while (recordData.length >= RECORD_PACKET_SIZE) {
      const record = decodeRecordData40(
        recordData.subarray(0, RECORD_PACKET_SIZE),
      );
      records.push({ ...record, ip: this.ip });
      recordData = recordData.subarray(RECORD_PACKET_SIZE);
    }

    return { data: records };
  }

  async freeData(): Promise<Buffer> {
    return this.executeCmd(COMMANDS.CMD_FREE_DATA, Buffer.alloc(0));
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
    const socket = this.socket;
    if (!socket || socket.destroyed) {
      return this.closeSocket();
    }

    try {
      await this.executeCmd(COMMANDS.CMD_EXIT, Buffer.alloc(0));
    } catch (err) {
      // Best effort disconnect; ignore command failure but log for traceability.
      log(
        `[TCP][DISCONNECT] ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return this.closeSocket();
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

  async getTime(): Promise<Date> {
    const data = await this.executeCmd(COMMANDS.CMD_GET_TIME, Buffer.alloc(0));
    return decodeDeviceTimestamp(data.readUInt32LE(8));
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

  async clearAttendanceLog(): Promise<Buffer> {
    return this.executeCmd(COMMANDS.CMD_CLEAR_ATTLOG, Buffer.alloc(0));
  }

  async getRealTimeLogs(cb: RealTimeLogCallback = () => {}): Promise<void> {
    this.replyId += 1;

    const buffer = createTCPHeader(
      COMMANDS.CMD_REG_EVENT,
      this.sessionId ?? 0,
      this.replyId,
      REQUEST_DATA.GET_REAL_TIME_EVENT,
    );

    const socket = this.ensureSocket();

    await new Promise<void>((resolve, reject) => {
      socket.write(buffer, err => {
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
    let tcpBuffer = Buffer.alloc(0);

    const handleData = (incoming: Buffer) => {
      tcpBuffer = Buffer.concat([tcpBuffer, incoming]);

      while (tcpBuffer.length >= 8) {
        const payloadLength = tcpBuffer.readUInt16LE(4);
        const frameLength = 8 + payloadLength;

        if (tcpBuffer.length < frameLength) {
          break;
        }

        const frame = tcpBuffer.subarray(0, frameLength);
        tcpBuffer = tcpBuffer.subarray(frameLength);

        if (frame.length < 16 || !isEventTCP(frame)) {
          continue;
        }

        const header = decodeTCPHeader(frame.subarray(0, 16));
        this.sessionId = header.sessionId;

        const ack = createTCPHeader(
          COMMANDS.CMD_ACK_OK,
          header.sessionId,
          header.replyId,
          Buffer.alloc(4),
        );
        socket.write(ack);

        cb(decodeRecordRealTimeLog52(frame));
      }
    };

    socket.on('data', handleData);
    socket.once('close', () => {
      this.isRealtimeListening = false;
      tcpBuffer = Buffer.alloc(0);
    });
  }

  getSocketStatus(): boolean {
    return this.socket !== null;
  }
}

export default JTCP;
