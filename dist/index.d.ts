import net from 'node:net';
import dgram from 'node:dgram';

declare const decodeUserData28: (userData: Buffer) => {
    uid: number;
    role: number;
};
declare const decodeUserData72: (userData: Buffer) => {
    uid: number;
    role: number;
    password: string | undefined;
    name: string | undefined;
    cardno: number;
    userId: string | undefined;
};
declare const decodeRecordData40: (recordData: Buffer) => {
    userSn: number;
    deviceUserId: string | undefined;
    recordTime: string;
};
declare const decodeRecordData16: (recordData: Buffer) => {
    deviceUserId: number;
    recordTime: Date;
};
declare const decodeRecordRealTimeLog18: (recordData: Buffer) => {
    userId: number;
    attTime: Date;
};
declare const decodeRecordRealTimeLog52: (recordData: Buffer) => {
    userId: string | undefined;
    attTime: Date;
};

type ErrorCallback$1 = (error: Error) => void;
type CloseCallback$1 = (protocol: 'tcp') => void;
type ChunkProgressCallback$1 = (receivedBytes: number, totalBytes: number) => void;
type RealTimeLogCallback$1 = (log: ReturnType<typeof decodeRecordRealTimeLog52>) => void;
interface ReadWithBufferResult$1 {
    data: Buffer;
    err?: Error | null;
    mode?: number;
}
type UserRecord$1 = ReturnType<typeof decodeUserData72>;
type AttendanceRecord$1 = ReturnType<typeof decodeRecordData40> & {
    ip: string;
};
declare class JTCP {
    private readonly ip;
    private readonly port;
    private readonly timeout?;
    private sessionId;
    private replyId;
    private socket;
    constructor(ip: string, port: number, timeout?: number | undefined);
    createSocket(cbError?: ErrorCallback$1, cbClose?: CloseCallback$1): Promise<net.Socket>;
    connect(): Promise<boolean>;
    closeSocket(): Promise<boolean>;
    private ensureSocket;
    executeCmd(command: number, data: Buffer | string): Promise<Buffer>;
    writeMessage(msg: Buffer, connect: boolean): Promise<Buffer>;
    requestData(msg: Buffer): Promise<Buffer>;
    sendChunkRequest(start: number, size: number): void;
    readWithBuffer(reqData: Buffer, cb?: ChunkProgressCallback$1): Promise<ReadWithBufferResult$1>;
    getSmallAttendanceLogs(): Promise<void>;
    getUsers(): Promise<{
        data: UserRecord$1[];
    }>;
    getAttendances(callbackInProcess?: ChunkProgressCallback$1): Promise<{
        data: AttendanceRecord$1[];
    }>;
    freeData(): Promise<Buffer>;
    disableDevice(): Promise<Buffer>;
    enableDevice(): Promise<Buffer>;
    disconnect(): Promise<boolean>;
    getInfo(): Promise<{
        userCounts: number;
        logCounts: number;
        logCapacity: number;
    }>;
    getSerialNumber(): Promise<string>;
    getDeviceVersion(): Promise<string>;
    getDeviceName(): Promise<string>;
    getPlatform(): Promise<string>;
    getOS(): Promise<string>;
    getWorkCode(): Promise<string>;
    getPIN(): Promise<string>;
    getFaceOn(): Promise<'Yes' | 'No'>;
    getSSR(): Promise<string>;
    getFirmware(): Promise<string>;
    getTime(): Promise<Date>;
    setUser(uid: number, userId: string, name: string, password: string, role?: number, cardNo?: number | string): Promise<Buffer | false>;
    getAttendanceSize(): Promise<number>;
    clearAttendanceLog(): Promise<Buffer>;
    getRealTimeLogs(cb?: RealTimeLogCallback$1): Promise<void>;
    getSocketStatus(): boolean;
}

type ErrorCallback = (error: Error) => void;
type CloseCallback = (protocol: 'udp') => void;
type ChunkProgressCallback = (receivedBytes: number, totalBytes: number) => void;
type RealTimeLogCallback = (log: ReturnType<typeof decodeRecordRealTimeLog18>) => void;
interface ReadWithBufferResult {
    data: Buffer;
    err: Error | null;
    mode?: number;
}
type UserRecord = ReturnType<typeof decodeUserData28>;
type AttendanceRecord = ReturnType<typeof decodeRecordData16> & {
    ip: string;
};
declare class JUDP {
    private readonly ip;
    private readonly port;
    private readonly timeout;
    private readonly inboundPort;
    private socket;
    private sessionId;
    private replyId;
    constructor(ip: string, port: number, timeout: number | undefined, inboundPort: number);
    createSocket(cbError?: ErrorCallback, cbClose?: CloseCallback): Promise<dgram.Socket>;
    connect(): Promise<boolean>;
    closeSocket(): Promise<boolean>;
    private ensureSocket;
    executeCmd(command: number, data: Buffer | string): Promise<Buffer>;
    writeMessage(msg: Buffer, connect: boolean): Promise<Buffer>;
    requestData(msg: Buffer): Promise<Buffer>;
    sendChunkRequest(start: number, size: number): void;
    readWithBuffer(reqData: Buffer, cb?: ChunkProgressCallback | null): Promise<ReadWithBufferResult>;
    getUsers(): Promise<{
        data: UserRecord[];
        err: Error | null;
    }>;
    getAttendances(callbackInProcess?: ChunkProgressCallback): Promise<{
        data: AttendanceRecord[];
        err: Error | null;
    }>;
    freeData(): Promise<Buffer>;
    getInfo(): Promise<{
        userCounts: number;
        logCounts: number;
        logCapacity: number;
    }>;
    getTime(): Promise<Date>;
    clearAttendanceLog(): Promise<Buffer>;
    disableDevice(): Promise<Buffer>;
    enableDevice(): Promise<Buffer>;
    disconnect(): Promise<boolean>;
    getSerialNumber(): Promise<string>;
    getDeviceVersion(): Promise<string>;
    getDeviceName(): Promise<string>;
    getPlatform(): Promise<string>;
    getOS(): Promise<string>;
    getWorkCode(): Promise<string>;
    getPIN(): Promise<string>;
    getFaceOn(): Promise<'Yes' | 'No'>;
    getSSR(): Promise<string>;
    getFirmware(): Promise<string>;
    setUser(uid: number, userId: string, name: string, password: string, role?: number, cardNo?: number | string): Promise<Buffer | false>;
    getAttendanceSize(): Promise<number>;
    getRealTimeLogs(cb?: RealTimeLogCallback): Promise<void>;
    getSocketStatus(): boolean;
}

type ConnectionType = 'tcp' | 'udp' | null;
type SocketErrorCallback = (error: Error) => void;
type SocketCloseCallback = (protocol: 'tcp' | 'udp') => void;
type TcpRealTimeLogCallback = Parameters<JTCP['getRealTimeLogs']>[0];
type UdpRealTimeLogCallback = Parameters<JUDP['getRealTimeLogs']>[0];
type UnifiedRealTimeLogCallback = TcpRealTimeLogCallback | UdpRealTimeLogCallback;
declare class ZKAttendanceClient {
    private readonly ip;
    private readonly port;
    private readonly timeout;
    private connectionType;
    private readonly jtcp;
    private readonly judp;
    private interval;
    private timer;
    private isBusy;
    constructor(ip: string, port?: number, timeout?: number, inboundPort?: number);
    private isErrnoException;
    private functionWrapper;
    private safeDisconnectTcp;
    private safeDisconnectUdp;
    createSocket(cbErr?: SocketErrorCallback, cbClose?: SocketCloseCallback): Promise<void>;
    getUsers(): Promise<{
        data: {
            uid: number;
            role: number;
            password: string | undefined;
            name: string | undefined;
            cardno: number;
            userId: string | undefined;
        }[];
    } | {
        data: {
            uid: number;
            role: number;
        }[];
        err: Error | null;
    }>;
    getTime(): Promise<Date>;
    getSerialNumber(): Promise<string>;
    getDeviceVersion(): Promise<string>;
    getDeviceName(): Promise<string>;
    getPlatform(): Promise<string>;
    getOS(): Promise<string>;
    getWorkCode(): Promise<string>;
    getPIN(): Promise<string>;
    getFaceOn(): Promise<"Yes" | "No">;
    getSSR(): Promise<string>;
    getFirmware(): Promise<string>;
    setUser(uid: number, userId: string, name: string, password: string, role?: number, cardNo?: number | string): Promise<false | Buffer<ArrayBufferLike>>;
    getAttendanceSize(): Promise<number>;
    getAttendances(cb?: (received: number, total: number) => void): Promise<{
        data: ({
            userSn: number;
            deviceUserId: string | undefined;
            recordTime: string;
        } & {
            ip: string;
        })[];
    } | {
        data: ({
            deviceUserId: number;
            recordTime: Date;
        } & {
            ip: string;
        })[];
        err: Error | null;
    }>;
    getRealTimeLogs(cb?: UnifiedRealTimeLogCallback): Promise<void>;
    disconnect(): Promise<boolean>;
    freeData(): Promise<Buffer<ArrayBufferLike>>;
    disableDevice(): Promise<Buffer<ArrayBufferLike>>;
    enableDevice(): Promise<Buffer<ArrayBufferLike>>;
    getInfo(): Promise<{
        userCounts: number;
        logCounts: number;
        logCapacity: number;
    } | {
        userCounts: number;
        logCounts: number;
        logCapacity: number;
    }>;
    getSocketStatus(): Promise<boolean>;
    clearAttendanceLog(): Promise<Buffer<ArrayBufferLike>>;
    executeCmd(command: number, data?: Buffer | string): Promise<Buffer<ArrayBufferLike>>;
    setIntervalSchedule(cb: () => void, timer: number): void;
    setTimerSchedule(cb: () => void, timer: number): void;
    clearIntervalSchedule(): void;
    clearTimerSchedule(): void;
    isConnected(): boolean;
    getConnectionType(): ConnectionType;
    setTime(date?: Date): Promise<Buffer<ArrayBufferLike>>;
    deleteUser(uid: number | string): Promise<unknown>;
    restart(): Promise<Buffer<ArrayBufferLike>>;
    powerOff(): Promise<Buffer<ArrayBufferLike>>;
}

export { ZKAttendanceClient as default };
