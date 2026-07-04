import { COMMANDS, USHRT_MAX } from '../constants/command';
import { log } from '../logs/log';
import { decode as parseTimeToDate } from './time';

/** Parses a 6-byte hex buffer into a Date object. */
const parseHexToTime = (hex: Buffer): Date => {
  const time = {
    year: hex.readUIntLE(0, 1),
    month: hex.readUIntLE(1, 1),
    date: hex.readUIntLE(2, 1),
    hour: hex.readUIntLE(3, 1),
    minute: hex.readUIntLE(4, 1),
    second: hex.readUIntLE(5, 1),
  };

  return new Date(
    2000 + time.year,
    time.month - 1,
    time.date,
    time.hour,
    time.minute,
    time.second,
  );
};

/** Creates a checksum for the given buffer. */
const createChkSum = (buf: Buffer): number => {
  let chksum = 0;
  for (let i = 0; i < buf.length; i += 2) {
    if (i == buf.length - 1) {
      chksum += buf[i];
    } else {
      chksum += buf.readUInt16LE(i);
    }
    chksum %= USHRT_MAX;
  }
  chksum = USHRT_MAX - chksum - 1;

  return chksum;
};

/** Creates a UDP header buffer for the given command and data. */
export const createUDPHeader = (
  command: (typeof COMMANDS)[keyof typeof COMMANDS],
  sessionId: number,
  replyId: number,
  data: Buffer | string,
) => {
  const dataBuffer = Buffer.from(data);
  const buf = Buffer.alloc(8 + dataBuffer.length);

  buf.writeUInt16LE(command, 0);
  buf.writeUInt16LE(0, 2);

  buf.writeUInt16LE(sessionId, 4);
  buf.writeUInt16LE(replyId, 6);
  dataBuffer.copy(buf, 8);

  const chksum2 = createChkSum(buf);
  buf.writeUInt16LE(chksum2, 2);

  replyId = (replyId + 1) % USHRT_MAX;
  buf.writeUInt16LE(replyId, 6);

  return buf;
};

/** Creates a TCP header buffer for the given command and data. */
export const createTCPHeader = (
  command: (typeof COMMANDS)[keyof typeof COMMANDS],
  sessionId: number,
  replyId: number,
  data: Buffer | string,
) => {
  const dataBuffer = Buffer.from(data);
  const buf = Buffer.alloc(8 + dataBuffer.length);

  buf.writeUInt16LE(command, 0);
  buf.writeUInt16LE(0, 2);

  buf.writeUInt16LE(sessionId, 4);
  buf.writeUInt16LE(replyId, 6);
  dataBuffer.copy(buf, 8);

  const chksum2 = createChkSum(buf);
  buf.writeUInt16LE(chksum2, 2);

  replyId = (replyId + 1) % USHRT_MAX;
  buf.writeUInt16LE(replyId, 6);

  const prefixBuf = Buffer.from([
    0x50, 0x50, 0x82, 0x7d, 0x13, 0x00, 0x00, 0x00,
  ]);

  prefixBuf.writeUInt16LE(buf.length, 4);

  return Buffer.concat([prefixBuf, buf]);
};

/** Removes the TCP header from the buffer. */
export const removeTcpHeader = (buf: Buffer): Buffer => {
  if (buf.length < 8) {
    return buf;
  }

  if (buf.compare(Buffer.from([0x50, 0x50, 0x82, 0x7d]), 0, 4, 0, 4) !== 0) {
    return buf;
  }

  return buf.subarray(8);
};

/** Decodes user data from a 28-byte buffer. */
export const decodeUserData28 = (
  userData: Buffer,
): { uid: number; role: number } => {
  const user = {
    uid: userData.readUIntLE(0, 2),
    role: userData.readUIntLE(2, 1),
    name: userData
      .subarray(8, 8 + 8)
      .toString('ascii')
      .split('\0')
      .shift(),
    userId: userData.readUIntLE(24, 4),
  };
  return user;
};

/** Decodes user data from a 72-byte buffer. */
export const decodeUserData72 = (userData: Buffer) => {
  const user = {
    uid: userData.readUIntLE(0, 2),
    role: userData.readUIntLE(2, 1),
    password: userData
      .subarray(3, 3 + 8)
      .toString('ascii')
      .split('\0')
      .shift(),
    name: userData.subarray(11).toString('ascii').split('\0').shift(),
    cardno: userData.readUIntLE(35, 4),
    userId: userData
      .subarray(48, 48 + 9)
      .toString('ascii')
      .split('\0')
      .shift(),
  };
  return user;
};

/** Decodes record data from a 40-byte buffer. */
export const decodeRecordData40 = (recordData: Buffer) => {
  const record = {
    userSn: recordData.readUIntLE(0, 2),
    deviceUserId: recordData
      .subarray(2, 2 + 9)
      .toString('ascii')
      .split('\0')
      .shift(),
    recordTime: parseTimeToDate(recordData.readUInt32LE(27)).toString(),
  };
  return record;
};

/** Decodes record data from a 16-byte buffer. */
export const decodeRecordData16 = (recordData: Buffer) => {
  const record = {
    deviceUserId: recordData.readUIntLE(0, 2),
    recordTime: parseTimeToDate(recordData.readUInt32LE(4)),
  };
  return record;
};

/** Decodes real-time log record from an 18-byte buffer. */
export const decodeRecordRealTimeLog18 = (recordData: Buffer) => {
  const userId = recordData.readUIntLE(8, 1);
  const attTime = parseHexToTime(recordData.subarray(12, 18));
  return { userId, attTime };
};

/** Decodes real-time log record from a 52-byte buffer. */
export const decodeRecordRealTimeLog52 = (recordData: Buffer) => {
  const payload = removeTcpHeader(recordData);

  const recvData = payload.subarray(8);

  const userId = recvData.subarray(0, 9).toString('ascii').split('\0').shift();

  const attTime = parseHexToTime(recvData.subarray(26, 26 + 6));

  return { userId, attTime };
};

/** Decodes the UDP header from a buffer. */
export const decodeUDPHeader = (header: Buffer) => {
  const commandId = header.readUIntLE(0, 2);
  const checkSum = header.readUIntLE(2, 2);
  const sessionId = header.readUIntLE(4, 2);
  const replyId = header.readUIntLE(6, 2);
  return { commandId, checkSum, sessionId, replyId };
};
/** Decodes the TCP header from a buffer. */
export const decodeTCPHeader = (header: Buffer) => {
  const recvData = header.subarray(8);
  const payloadSize = header.readUIntLE(4, 2);

  const commandId = recvData.readUIntLE(0, 2);
  const checkSum = recvData.readUIntLE(2, 2);
  const sessionId = recvData.readUIntLE(4, 2);
  const replyId = recvData.readUIntLE(6, 2);
  return { commandId, checkSum, sessionId, replyId, payloadSize };
};

/** Exports an error message based on the command value. */
export const exportErrorMessage = (commandValue: number) => {
  for (const [key, value] of Object.entries(COMMANDS)) {
    if (value === commandValue) {
      return key;
    }
  }

  return 'AN UNKNOWN ERROR';
};

/** Returns true when the TCP buffer contains a real-time event packet. */
export const isEventTCP = (data: Buffer): boolean => {
  try {
    const payload = removeTcpHeader(data);
    if (payload.length < 2) return false;

    const commandId = payload.readUInt16LE(0);
    return commandId === COMMANDS.CMD_REG_EVENT;
  } catch (err) {
    log(`[EVENT_DETECT_TCP] ${String(err)} ,${data.toString('hex')}`);
    return false;
  }
};

/** Returns true when the UDP buffer contains a real-time event packet. */
export const isEventUDP = (data: Buffer): boolean => {
  if (data.length < 8) return false;
  try {
    const commandId = decodeUDPHeader(data.subarray(0, 8)).commandId;
    return commandId === COMMANDS.CMD_REG_EVENT;
  } catch (err) {
    log(`[EVENT_DETECT_UDP] ${String(err)} ,${data.toString('hex')}`);
    return false;
  }
};
