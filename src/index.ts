/*  
    Author: Md Rasheduzzaman
    Email:  jmrashed@example.com
    Date: 2025-02-09
*/
import { COMMANDS } from './constants/command';
import { ERROR_TYPES, ZKError } from './exceptions/handler';
import JTCP from './helper/jtcp';
import JUDP from './helper/judp';
import { encode as encodeDeviceTimestamp } from './helper/time';

type ConnectionType = 'tcp' | 'udp' | null;
type SocketErrorCallback = (error: Error) => void;
type SocketCloseCallback = (protocol: 'tcp' | 'udp') => void;

type AsyncCallback<T> = () => Promise<T>;
type TcpRealTimeLogCallback = Parameters<JTCP['getRealTimeLogs']>[0];
type UdpRealTimeLogCallback = Parameters<JUDP['getRealTimeLogs']>[0];
type UnifiedRealTimeLogCallback =
  | TcpRealTimeLogCallback
  | UdpRealTimeLogCallback;

class ZKAttendanceClient {
  private connectionType: ConnectionType = null;
  private readonly jtcp: JTCP;
  private readonly judp: JUDP;
  private interval: NodeJS.Timeout | null = null;
  private timer: NodeJS.Timeout | null = null;
  private isBusy = false;

  constructor(
    private readonly ip: string,
    private readonly port: number = 4370,
    private readonly timeout: number = 5000,
    inboundPort?: number,
  ) {
    const resolvedInboundPort = inboundPort ?? this.port;
    this.jtcp = new JTCP(this.ip, this.port, this.timeout);
    this.judp = new JUDP(this.ip, this.port, this.timeout, resolvedInboundPort);
  }

  private isErrnoException(err: unknown): err is NodeJS.ErrnoException {
    return Boolean(err && typeof err === 'object' && 'code' in err);
  }

  private async functionWrapper<T, U>(
    tcpCallback: AsyncCallback<T>,
    udpCallback: AsyncCallback<U>,
    command: string,
  ): Promise<T | U> {
    if (this.isBusy) {
      throw new ZKError(
        new Error('Device is busy, try again later'),
        `[BUSY] ${command}`,
        this.ip,
      );
    }

    this.isBusy = true;
    switch (this.connectionType) {
      case 'tcp': {
        if (!this.jtcp.getSocketStatus()) {
          this.isBusy = false;
          throw new ZKError(
            new Error("Socket isn't connected !"),
            '[TCP]',
            this.ip,
          );
        }
        try {
          return await tcpCallback();
        } catch (err) {
          throw new ZKError(err, `[TCP] ${command}`, this.ip);
        } finally {
          this.isBusy = false;
        }
      }
      case 'udp': {
        if (!this.judp.getSocketStatus()) {
          this.isBusy = false;
          throw new ZKError(
            new Error("Socket isn't connected !"),
            '[UDP]',
            this.ip,
          );
        }
        try {
          return await udpCallback();
        } catch (err) {
          throw new ZKError(err, `[UDP] ${command}`, this.ip);
        } finally {
          this.isBusy = false;
        }
      }
      default:
        this.isBusy = false;
        throw new ZKError(new Error("Socket isn't connected !"), '', this.ip);
    }
  }

  private async safeDisconnectTcp(): Promise<void> {
    try {
      await this.jtcp.disconnect();
    } catch {
      // best effort
    }
  }

  private async safeDisconnectUdp(): Promise<void> {
    try {
      await this.judp.disconnect();
    } catch {
      // best effort
    }
  }

  async createSocket(
    cbErr?: SocketErrorCallback,
    cbClose?: SocketCloseCallback,
  ): Promise<void> {
    if (this.isBusy) {
      throw new ZKError(
        new Error('Device is busy, try again later'),
        '[BUSY] CREATE_SOCKET',
        this.ip,
      );
    }

    this.isBusy = true;
    try {
      try {
        if (!this.jtcp.getSocketStatus()) {
          await this.jtcp.createSocket(cbErr, cbClose);
          await this.jtcp.connect();
          // eslint-disable-next-line no-console
          console.log('ok tcp');
        }
        this.connectionType = 'tcp';
        return;
      } catch (err) {
        await this.safeDisconnectTcp();

        if (
          !this.isErrnoException(err) ||
          err.code !== ERROR_TYPES.ECONNREFUSED
        ) {
          throw new ZKError(err, 'TCP CONNECT', this.ip);
        }
      }

      try {
        if (!this.judp.getSocketStatus()) {
          await this.judp.createSocket(cbErr, cbClose);
          await this.judp.connect();
          // eslint-disable-next-line no-console
          console.log('ok udp');
        }
        this.connectionType = 'udp';
      } catch (err) {
        if (this.isErrnoException(err) && err.code === ERROR_TYPES.EADDRINUSE) {
          this.connectionType = 'udp';
          return;
        }

        this.connectionType = null;
        await this.safeDisconnectUdp();
        await this.safeDisconnectTcp();
        throw new ZKError(err, 'UDP CONNECT', this.ip);
      }
    } finally {
      this.isBusy = false;
    }
  }

  async getUsers() {
    return this.functionWrapper(
      () => this.jtcp.getUsers(),
      () => this.judp.getUsers(),
      'GET_USERS',
    );
  }

  async getTime() {
    return this.functionWrapper(
      () => this.jtcp.getTime(),
      () => this.judp.getTime(),
      'GET_TIME',
    );
  }

  async getSerialNumber() {
    return this.functionWrapper(
      () => this.jtcp.getSerialNumber(),
      () => this.judp.getSerialNumber(),
      'GET_SERIAL_NUMBER',
    );
  }

  async getDeviceVersion() {
    return this.functionWrapper(
      () => this.jtcp.getDeviceVersion(),
      () => this.judp.getDeviceVersion(),
      'GET_DEVICE_VERSION',
    );
  }

  async getDeviceName() {
    return this.functionWrapper(
      () => this.jtcp.getDeviceName(),
      () => this.judp.getDeviceName(),
      'GET_DEVICE_NAME',
    );
  }

  async getPlatform() {
    return this.functionWrapper(
      () => this.jtcp.getPlatform(),
      () => this.judp.getPlatform(),
      'GET_PLATFORM',
    );
  }

  async getOS() {
    return this.functionWrapper(
      () => this.jtcp.getOS(),
      () => this.judp.getOS(),
      'GET_OS',
    );
  }

  async getWorkCode() {
    return this.functionWrapper(
      () => this.jtcp.getWorkCode(),
      () => this.judp.getWorkCode(),
      'GET_WORK_CODE',
    );
  }

  async getPIN() {
    return this.functionWrapper(
      () => this.jtcp.getPIN(),
      () => this.judp.getPIN(),
      'GET_PIN',
    );
  }

  async getFaceOn() {
    return this.functionWrapper(
      () => this.jtcp.getFaceOn(),
      () => this.judp.getFaceOn(),
      'GET_FACE_ON',
    );
  }

  async getSSR() {
    return this.functionWrapper(
      () => this.jtcp.getSSR(),
      () => this.judp.getSSR(),
      'GET_SSR',
    );
  }

  async getFirmware() {
    return this.functionWrapper(
      () => this.jtcp.getFirmware(),
      () => this.judp.getFirmware(),
      'GET_FIRMWARE',
    );
  }

  async setUser(
    uid: number,
    userId: string,
    name: string,
    password: string,
    role = 0,
    cardNo: number | string = 0,
  ) {
    return this.functionWrapper(
      () => this.jtcp.setUser(uid, userId, name, password, role, cardNo),
      () => this.judp.setUser(uid, userId, name, password, role, cardNo),
      'SET_USER',
    );
  }

  async getAttendanceSize() {
    return this.functionWrapper(
      () => this.jtcp.getAttendanceSize(),
      () => this.judp.getAttendanceSize(),
      'GET_ATTENDANCE_SIZE',
    );
  }

  async getAttendances(cb?: (received: number, total: number) => void) {
    return this.functionWrapper(
      () => this.jtcp.getAttendances(cb),
      () => this.judp.getAttendances(cb),
      'GET_ATTENDANCES',
    );
  }

  async getRealTimeLogs(cb?: UnifiedRealTimeLogCallback) {
    return this.functionWrapper(
      () => this.jtcp.getRealTimeLogs(cb as TcpRealTimeLogCallback | undefined),
      () => this.judp.getRealTimeLogs(cb as UdpRealTimeLogCallback | undefined),
      'GET_REAL_TIME_LOGS',
    );
  }

  async disconnect() {
    const result = await this.functionWrapper(
      () => this.jtcp.disconnect(),
      () => this.judp.disconnect(),
      'DISCONNECT',
    );
    this.connectionType = null;
    return result;
  }

  async freeData() {
    return this.functionWrapper(
      () => this.jtcp.freeData(),
      () => this.judp.freeData(),
      'FREE_DATA',
    );
  }

  async disableDevice() {
    return this.functionWrapper(
      () => this.jtcp.disableDevice(),
      () => this.judp.disableDevice(),
      'DISABLE_DEVICE',
    );
  }

  async enableDevice() {
    return this.functionWrapper(
      () => this.jtcp.enableDevice(),
      () => this.judp.enableDevice(),
      'ENABLE_DEVICE',
    );
  }

  async getInfo() {
    return this.functionWrapper(
      () => this.jtcp.getInfo(),
      () => this.judp.getInfo(),
      'GET_INFO',
    );
  }

  async getSocketStatus() {
    return this.functionWrapper(
      async () => this.jtcp.getSocketStatus(),
      async () => this.judp.getSocketStatus(),
      'GET_SOCKET_STATUS',
    );
  }

  async clearAttendanceLog() {
    return this.functionWrapper(
      () => this.jtcp.clearAttendanceLog(),
      () => this.judp.clearAttendanceLog(),
      'CLEAR_ATTENDANCE_LOG',
    );
  }

  async executeCmd(command: number, data: Buffer | string = '') {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(command, data),
      () => this.judp.executeCmd(command, data),
      'EXECUTE_CMD',
    );
  }

  setIntervalSchedule(cb: () => void, timer: number): void {
    this.interval = setInterval(cb, timer);
  }

  setTimerSchedule(cb: () => void, timer: number): void {
    this.timer = setTimeout(cb, timer);
  }

  clearIntervalSchedule(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  clearTimerSchedule(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  isConnected(): boolean {
    if (this.connectionType === 'tcp') {
      return this.jtcp.getSocketStatus();
    }
    if (this.connectionType === 'udp') {
      return this.judp.getSocketStatus();
    }
    return false;
  }

  getConnectionType(): ConnectionType {
    return this.connectionType;
  }

  async setTime(date = new Date()) {
    const payload = Buffer.alloc(4);
    payload.writeUInt32LE(encodeDeviceTimestamp(date), 0);

    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_SET_TIME, payload),
      () => this.judp.executeCmd(COMMANDS.CMD_SET_TIME, payload),
      'SET_TIME',
    );
  }

  async deleteUser(uid: number | string): Promise<unknown> {
    const userId = typeof uid === 'string' ? Number.parseInt(uid, 10) : uid;
    if (Number.isNaN(userId)) {
      throw new ZKError(new Error('Invalid user id'), 'DELETE_USER', this.ip);
    }

    const payload = Buffer.alloc(2);
    payload.writeUInt16LE(userId, 0);

    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_DELETE_USER, payload),
      () => this.judp.executeCmd(COMMANDS.CMD_DELETE_USER, payload),
      'DELETE_USER',
    );
  }

  async restart() {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_RESTART, Buffer.alloc(0)),
      () => this.judp.executeCmd(COMMANDS.CMD_RESTART, Buffer.alloc(0)),
      'RESTART',
    );
  }

  async powerOff() {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_POWEROFF, Buffer.alloc(0)),
      () => this.judp.executeCmd(COMMANDS.CMD_POWEROFF, Buffer.alloc(0)),
      'POWER_OFF',
    );
  }
}

export default ZKAttendanceClient;
