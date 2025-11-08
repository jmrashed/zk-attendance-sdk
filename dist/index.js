"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/constants/command.ts
var COMMANDS = {
  CMD_CONNECT: 1e3,
  CMD_EXIT: 1001,
  CMD_ENABLEDEVICE: 1002,
  CMD_DISABLEDEVICE: 1003,
  CMD_RESTART: 1004,
  CMD_POWEROFF: 1005,
  CMD_SLEEP: 1006,
  CMD_RESUME: 1007,
  CMD_CAPTUREFINGER: 1009,
  CMD_TEST_TEMP: 1011,
  CMD_CAPTUREIMAGE: 1012,
  CMD_REFRESHDATA: 1013,
  CMD_REFRESHOPTION: 1014,
  CMD_TESTVOICE: 1017,
  CMD_GET_VERSION: 1100,
  //firmware version
  CMD_CHANGE_SPEED: 1101,
  CMD_AUTH: 1102,
  CMD_PREPARE_DATA: 1500,
  CMD_DATA: 1501,
  CMD_FREE_DATA: 1502,
  CMD_DATA_WRRQ: 1503,
  CMD_DATA_RDY: 1504,
  CMD_DB_RRQ: 7,
  CMD_USER_WRQ: 8,
  CMD_USERTEMP_RRQ: 9,
  CMD_USERTEMP_WRQ: 10,
  CMD_OPTIONS_RRQ: 11,
  //device
  CMD_OPTIONS_WRQ: 12,
  CMD_ATTLOG_RRQ: 13,
  CMD_CLEAR_DATA: 14,
  CMD_CLEAR_ATTLOG: 15,
  CMD_DELETE_USER: 18,
  CMD_DELETE_USERTEMP: 19,
  CMD_CLEAR_ADMIN: 20,
  CMD_USERGRP_RRQ: 21,
  CMD_USERGRP_WRQ: 22,
  CMD_USERTZ_RRQ: 23,
  CMD_USERTZ_WRQ: 24,
  CMD_GRPTZ_RRQ: 25,
  CMD_GRPTZ_WRQ: 26,
  CMD_TZ_RRQ: 27,
  CMD_TZ_WRQ: 28,
  CMD_ULG_RRQ: 29,
  CMD_ULG_WRQ: 30,
  CMD_UNLOCK: 31,
  CMD_CLEAR_ACC: 32,
  CMD_CLEAR_OPLOG: 33,
  CMD_OPLOG_RRQ: 34,
  CMD_GET_FREE_SIZES: 50,
  CMD_ENABLE_CLOCK: 57,
  CMD_STARTVERIFY: 60,
  CMD_STARTENROLL: 61,
  CMD_CANCELCAPTURE: 62,
  CMD_STATE_RRQ: 64,
  CMD_WRITE_LCD: 66,
  CMD_CLEAR_LCD: 67,
  CMD_GET_PINWIDTH: 69,
  CMD_SMS_WRQ: 70,
  CMD_SMS_RRQ: 71,
  CMD_DELETE_SMS: 72,
  CMD_UDATA_WRQ: 73,
  CMD_DELETE_UDATA: 74,
  CMD_DOORSTATE_RRQ: 75,
  CMD_WRITE_MIFARE: 76,
  CMD_EMPTY_MIFARE: 78,
  CMD_VERIFY_WRQ: 79,
  CMD_VERIFY_RRQ: 80,
  CMD_TMP_WRITE: 87,
  CMD_CHECKSUM_BUFFER: 119,
  CMD_DEL_FPTMP: 134,
  CMD_GET_TIME: 201,
  CMD_SET_TIME: 202,
  CMD_REG_EVENT: 500,
  CMD_ACK_OK: 2e3,
  CMD_ACK_ERROR: 2001,
  CMD_ACK_DATA: 2002,
  CMD_ACK_RETRY: 2003,
  CMD_ACK_REPEAT: 2004,
  CMD_ACK_UNAUTH: 2005,
  CMD_ACK_UNKNOWN: 65535,
  CMD_ACK_ERROR_CMD: 65533,
  CMD_ACK_ERROR_INIT: 65532,
  CMD_ACK_ERROR_DATA: 65531,
  EF_ATTLOG: 1,
  EF_FINGER: 2,
  EF_ENROLLUSER: 4,
  EF_ENROLLFINGER: 8,
  EF_BUTTON: 16,
  EF_UNLOCK: 32,
  EF_VERIFY: 128,
  EF_FPFTR: 256,
  EF_ALARM: 512
};
var USHRT_MAX = 65535;
var MAX_CHUNK = 65472;
var REQUEST_DATA = {
  DISABLE_DEVICE: Buffer.from([0, 0, 0, 0]),
  GET_REAL_TIME_EVENT: Buffer.from([1, 0, 0, 0]),
  GET_ATTENDANCE_LOGS: Buffer.from([
    1,
    13,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ]),
  GET_USERS: Buffer.from([
    1,
    9,
    0,
    5,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ])
};

// src/exceptions/handler.ts
var ZKError = class {
  constructor(err, command, ip) {
    this.err = err;
    this.command = command;
    this.ip = ip;
  }
  getNormalizedError() {
    return this.err instanceof Error ? this.err : new Error(String(this.err));
  }
  isErrorWithCode(err) {
    return typeof err === "object" && err !== null && "code" in err && typeof err.code === "string";
  }
  /** Generates a user-friendly error message. */
  toast() {
    if (this.isErrorWithCode(this.err)) {
      if (this.err.code === "ECONNRESET" /* ECONNRESET */) {
        return "Another device is connecting to the device so the connection is interrupted";
      }
      if (this.err.code === "ECONNREFUSED" /* ECONNREFUSED */) {
        return "IP of the device is refused";
      }
      return this.getNormalizedError().message;
    }
    return this.getNormalizedError().message;
  }
  /** Gets the error details. */
  getError() {
    const normalized = this.getNormalizedError();
    let code;
    if (this.isErrorWithCode(this.err)) {
      code = this.err.code;
    }
    return {
      err: {
        message: normalized.message,
        code
      },
      ip: this.ip,
      command: this.command
    };
  }
};

// src/helper/jtcp.ts
var import_node_net = __toESM(require("net"));

// src/logs/log.ts
var fs = __toESM(require("fs/promises"));
var parseCurrentTime = () => {
  const currentTime = /* @__PURE__ */ new Date();
  return {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth() + 1,
    day: currentTime.getDate(),
    hour: currentTime.getHours(),
    second: currentTime.getSeconds()
  };
};
var log = (text) => {
  const currentTime = parseCurrentTime();
  fs.appendFile(
    `${currentTime.day}`.padStart(2, "0") + `${currentTime.month}`.padStart(2, "0") + `${currentTime.year}.err.log`,
    `
 [${currentTime.hour}:${currentTime.second}] ${text}`
  ).catch(() => {
  });
};

// src/helper/time.ts
var decode = (time) => {
  const second = time % 60;
  time = (time - second) / 60;
  const minute = time % 60;
  time = (time - minute) / 60;
  const hour = time % 24;
  time = (time - hour) / 24;
  const day = time % 31 + 1;
  time = (time - (day - 1)) / 31;
  const month = time % 12;
  time = (time - month) / 12;
  const year = time + 2e3;
  return new Date(year, month, day, hour, minute, second);
};
var encode = (date) => {
  return (date.getFullYear() % 100 * 12 * 31 + date.getMonth() * 31 + date.getDate() - 1) * (24 * 60 * 60) + (date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds();
};

// src/helper/utils.ts
var parseHexToTime = (hex) => {
  const time = {
    year: hex.readUIntLE(0, 1),
    month: hex.readUIntLE(1, 1),
    date: hex.readUIntLE(2, 1),
    hour: hex.readUIntLE(3, 1),
    minute: hex.readUIntLE(4, 1),
    second: hex.readUIntLE(5, 1)
  };
  return new Date(
    2e3 + time.year,
    time.month - 1,
    time.date,
    time.hour,
    time.minute,
    time.second
  );
};
var createChkSum = (buf) => {
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
var createUDPHeader = (command, sessionId, replyId, data) => {
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
var createTCPHeader = (command, sessionId, replyId, data) => {
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
    80,
    80,
    130,
    125,
    19,
    0,
    0,
    0
  ]);
  prefixBuf.writeUInt16LE(buf.length, 4);
  return Buffer.concat([prefixBuf, buf]);
};
var removeTcpHeader = (buf) => {
  if (buf.length < 8) {
    return buf;
  }
  if (buf.compare(Buffer.from([80, 80, 130, 125]), 0, 4, 0, 4) !== 0) {
    return buf;
  }
  return buf.subarray(8);
};
var decodeUserData28 = (userData) => {
  const user = {
    uid: userData.readUIntLE(0, 2),
    role: userData.readUIntLE(2, 1),
    name: userData.subarray(8, 8 + 8).toString("ascii").split("\0").shift(),
    userId: userData.readUIntLE(24, 4)
  };
  return user;
};
var decodeUserData72 = (userData) => {
  const user = {
    uid: userData.readUIntLE(0, 2),
    role: userData.readUIntLE(2, 1),
    password: userData.subarray(3, 3 + 8).toString("ascii").split("\0").shift(),
    name: userData.subarray(11).toString("ascii").split("\0").shift(),
    cardno: userData.readUIntLE(35, 4),
    userId: userData.subarray(48, 48 + 9).toString("ascii").split("\0").shift()
  };
  return user;
};
var decodeRecordData40 = (recordData) => {
  const record = {
    userSn: recordData.readUIntLE(0, 2),
    deviceUserId: recordData.subarray(2, 2 + 9).toString("ascii").split("\0").shift(),
    recordTime: decode(recordData.readUInt32LE(27)).toString()
  };
  return record;
};
var decodeRecordData16 = (recordData) => {
  const record = {
    deviceUserId: recordData.readUIntLE(0, 2),
    recordTime: decode(recordData.readUInt32LE(4))
  };
  return record;
};
var decodeRecordRealTimeLog18 = (recordData) => {
  const userId = recordData.readUIntLE(8, 1);
  const attTime = parseHexToTime(recordData.subarray(12, 18));
  return { userId, attTime };
};
var decodeRecordRealTimeLog52 = (recordData) => {
  const payload = removeTcpHeader(recordData);
  const recvData = payload.subarray(8);
  const userId = recvData.subarray(0, 9).toString("ascii").split("\0").shift();
  const attTime = parseHexToTime(recvData.subarray(26, 26 + 6));
  return { userId, attTime };
};
var decodeUDPHeader = (header) => {
  const commandId = header.readUIntLE(0, 2);
  const checkSum = header.readUIntLE(2, 2);
  const sessionId = header.readUIntLE(4, 2);
  const replyId = header.readUIntLE(6, 2);
  return { commandId, checkSum, sessionId, replyId };
};
var decodeTCPHeader = (header) => {
  const recvData = header.subarray(8);
  const payloadSize = header.readUIntLE(4, 2);
  const commandId = recvData.readUIntLE(0, 2);
  const checkSum = recvData.readUIntLE(2, 2);
  const sessionId = recvData.readUIntLE(4, 2);
  const replyId = recvData.readUIntLE(6, 2);
  return { commandId, checkSum, sessionId, replyId, payloadSize };
};
var exportErrorMessage = (commandValue) => {
  for (const [key, value] of Object.entries(COMMANDS)) {
    if (value === commandValue) {
      return key;
    }
  }
  return "AN UNKNOWN ERROR";
};
var checkNotEventTCP = (data) => {
  try {
    data = removeTcpHeader(data);
    const commandId = data.readUIntLE(0, 2);
    const event = data.readUIntLE(4, 2);
    return event === COMMANDS.EF_ATTLOG && commandId === COMMANDS.CMD_REG_EVENT;
  } catch (err) {
    log(`[228] : ${String(err)} ,${data.toString("hex")} `);
    return false;
  }
};
var checkNotEventUDP = (data) => {
  const commandId = decodeUDPHeader(data.subarray(0, 8)).commandId;
  return commandId === COMMANDS.CMD_REG_EVENT;
};

// src/helper/jtcp.ts
var JTCP = class {
  constructor(ip, port, timeout) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.sessionId = null;
    this.replyId = 0;
    this.socket = null;
  }
  createSocket(cbError, cbClose) {
    return new Promise((resolve, reject) => {
      const socket = new import_node_net.default.Socket();
      this.socket = socket;
      socket.once("error", (err) => {
        reject(err);
        cbError?.(err);
      });
      socket.once("connect", () => {
        resolve(socket);
      });
      socket.once("close", () => {
        this.socket = null;
        cbClose?.("tcp");
      });
      if (this.timeout) {
        socket.setTimeout(this.timeout);
      }
      socket.connect(this.port, this.ip);
    });
  }
  async connect() {
    const reply = await this.executeCmd(COMMANDS.CMD_CONNECT, Buffer.alloc(0));
    return Boolean(reply);
  }
  async closeSocket() {
    const socket = this.socket;
    if (!socket) {
      return true;
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(true);
      }, 2e3);
      socket.removeAllListeners("data");
      socket.end(() => {
        clearTimeout(timer);
        this.socket = null;
        resolve(true);
      });
    });
  }
  ensureSocket() {
    if (!this.socket) {
      throw new Error("Socket is not initialized. Call createSocket() first.");
    }
    return this.socket;
  }
  executeCmd(command, data) {
    return new Promise(async (resolve, reject) => {
      if (command === COMMANDS.CMD_CONNECT) {
        this.sessionId = 0;
        this.replyId = 0;
      } else {
        this.replyId += 1;
      }
      const session = this.sessionId ?? 0;
      const buffer = createTCPHeader(
        command,
        session,
        this.replyId,
        data
      );
      try {
        const reply = await this.writeMessage(
          buffer,
          command === COMMANDS.CMD_CONNECT || command === COMMANDS.CMD_EXIT
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
  writeMessage(msg, connect) {
    return new Promise((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer = null;
      const handleData = (data) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener("data", handleData);
        resolve(data);
      };
      socket.once("data", handleData);
      socket.write(msg, (err) => {
        if (err) {
          socket.removeListener("data", handleData);
          reject(err);
          return;
        }
        if (this.timeout) {
          timer = setTimeout(
            () => {
              if (timer) {
                clearTimeout(timer);
              }
              socket.removeListener("data", handleData);
              reject(new Error("TIMEOUT_ON_WRITING_MESSAGE"));
            },
            connect ? 2e3 : this.timeout
          );
        }
      });
    });
  }
  requestData(msg) {
    return new Promise((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer = null;
      let replyBuffer = Buffer.alloc(0);
      const internalCallback = (data) => {
        socket.removeListener("data", handleOnData);
        if (timer) {
          clearTimeout(timer);
        }
        resolve(data);
      };
      const handleOnData = (data) => {
        replyBuffer = Buffer.concat([replyBuffer, data]);
        if (checkNotEventTCP(data)) return;
        if (timer) {
          clearTimeout(timer);
        }
        const header = decodeTCPHeader(replyBuffer.subarray(0, 16));
        if (header.commandId === COMMANDS.CMD_DATA) {
          timer = setTimeout(() => {
            internalCallback(replyBuffer);
          }, 1e3);
          return;
        }
        timer = setTimeout(() => {
          socket.removeListener("data", handleOnData);
          reject(new Error("TIMEOUT_ON_RECEIVING_REQUEST_DATA"));
        }, this.timeout ?? 0);
        const packetLength = data.readUIntLE(4, 2);
        if (packetLength > 8) {
          internalCallback(data);
        }
      };
      socket.on("data", handleOnData);
      socket.write(msg, (err) => {
        if (err) {
          socket.removeListener("data", handleOnData);
          reject(err);
          return;
        }
        timer = setTimeout(() => {
          socket.removeListener("data", handleOnData);
          reject(
            new Error("TIMEOUT_IN_RECEIVING_RESPONSE_AFTER_REQUESTING_DATA")
          );
        }, this.timeout ?? 0);
      });
    });
  }
  sendChunkRequest(start, size) {
    this.replyId += 1;
    const reqData = Buffer.alloc(8);
    reqData.writeUInt32LE(start, 0);
    reqData.writeUInt32LE(size, 4);
    const buffer = createTCPHeader(
      COMMANDS.CMD_DATA_RDY,
      this.sessionId ?? 0,
      this.replyId,
      reqData
    );
    const socket = this.ensureSocket();
    socket.write(buffer, (err) => {
      if (err) {
        log(`[TCP][SEND_CHUNK_REQUEST] ${err.toString()}`);
      }
    });
  }
  readWithBuffer(reqData, cb) {
    return new Promise(async (resolve, reject) => {
      this.replyId += 1;
      const buffer = createTCPHeader(
        COMMANDS.CMD_DATA_WRRQ,
        this.sessionId ?? 0,
        this.replyId,
        reqData
      );
      let reply;
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
          const timeout = 1e4;
          let timer = setTimeout(() => {
            internalCallback(
              replyData,
              new Error("TIMEOUT WHEN RECEIVING PACKET")
            );
          }, timeout);
          const internalCallback = (data, err = null) => {
            if (timer) {
              clearTimeout(timer);
            }
            socket.removeListener("data", handleOnData);
            resolve({ data, err });
          };
          const handleOnData = (incoming) => {
            if (checkNotEventTCP(incoming)) {
              return;
            }
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(() => {
              internalCallback(
                replyData,
                new Error(`TIME OUT !! ${totalPackets} PACKETS REMAIN !`)
              );
            }, timeout);
            totalBuffer = Buffer.concat([totalBuffer, incoming]);
            const packetLength = totalBuffer.readUIntLE(4, 2);
            if (totalBuffer.length >= 8 + packetLength) {
              realTotalBuffer = Buffer.concat([
                realTotalBuffer,
                totalBuffer.subarray(16, 8 + packetLength)
              ]);
              totalBuffer = totalBuffer.subarray(8 + packetLength);
              const fullChunkLength = MAX_CHUNK + 8;
              const finalChunkLength = remain + 8;
              if (totalPackets > 1 && realTotalBuffer.length === fullChunkLength || totalPackets === 1 && realTotalBuffer.length === finalChunkLength) {
                replyData = Buffer.concat([
                  replyData,
                  realTotalBuffer.subarray(8)
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
          socket.once("close", () => {
            internalCallback(
              replyData,
              new Error("Socket is disconnected unexpectedly")
            );
          });
          socket.on("data", handleOnData);
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
              `ERROR_IN_UNHANDLE_CMD ${exportErrorMessage(header.commandId)}`
            )
          );
        }
      }
    });
  }
  async getSmallAttendanceLogs() {
    return Promise.resolve();
  }
  async getUsers() {
    if (this.socket) {
      await this.freeData();
    }
    const response = await this.readWithBuffer(REQUEST_DATA.GET_USERS);
    if (this.socket) {
      await this.freeData();
    }
    const USER_PACKET_SIZE = 72;
    let userData = response.data.subarray(4);
    const users = [];
    while (userData.length >= USER_PACKET_SIZE) {
      const user = decodeUserData72(userData.subarray(0, USER_PACKET_SIZE));
      users.push(user);
      userData = userData.subarray(USER_PACKET_SIZE);
    }
    return { data: users };
  }
  async getAttendances(callbackInProcess = () => {
  }) {
    if (this.socket) {
      await this.freeData();
    }
    const response = await this.readWithBuffer(
      REQUEST_DATA.GET_ATTENDANCE_LOGS,
      callbackInProcess
    );
    if (this.socket) {
      await this.freeData();
    }
    const RECORD_PACKET_SIZE = 40;
    let recordData = response.data.subarray(4);
    const records = [];
    while (recordData.length >= RECORD_PACKET_SIZE) {
      const record = decodeRecordData40(
        recordData.subarray(0, RECORD_PACKET_SIZE)
      );
      records.push({ ...record, ip: this.ip });
      recordData = recordData.subarray(RECORD_PACKET_SIZE);
    }
    return { data: records };
  }
  async freeData() {
    return this.executeCmd(COMMANDS.CMD_FREE_DATA, Buffer.alloc(0));
  }
  async disableDevice() {
    return this.executeCmd(
      COMMANDS.CMD_DISABLEDEVICE,
      REQUEST_DATA.DISABLE_DEVICE
    );
  }
  async enableDevice() {
    return this.executeCmd(COMMANDS.CMD_ENABLEDEVICE, Buffer.alloc(0));
  }
  async disconnect() {
    try {
      await this.executeCmd(COMMANDS.CMD_EXIT, Buffer.alloc(0));
    } catch (err) {
      log(
        `[TCP][DISCONNECT] ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return this.closeSocket();
  }
  async getInfo() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0)
    );
    return {
      userCounts: data.readUIntLE(24, 4),
      logCounts: data.readUIntLE(40, 4),
      logCapacity: data.readUIntLE(72, 4)
    };
  }
  async getSerialNumber() {
    const keyword = "~SerialNumber";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("utf-8").replace(`${keyword}=`, "");
  }
  async getDeviceVersion() {
    const keyword = "~ZKFPVersion";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getDeviceName() {
    const keyword = "~DeviceName";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getPlatform() {
    const keyword = "~Platform";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getOS() {
    const keyword = "~OS";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getWorkCode() {
    const keyword = "WorkCode";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getPIN() {
    const keyword = "~PIN2Width";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getFaceOn() {
    const keyword = "FaceFunOn";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    const value = data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
    return value.includes("0") ? "No" : "Yes";
  }
  async getSSR() {
    const keyword = "~SSR";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getFirmware() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_VERSION,
      Buffer.alloc(0)
    );
    return data.subarray(8).toString("ascii");
  }
  async getTime() {
    const data = await this.executeCmd(COMMANDS.CMD_GET_TIME, Buffer.alloc(0));
    return decode(data.readUInt32LE(8));
  }
  async setUser(uid, userId, name, password, role = 0, cardNo = 0) {
    const cardNoStr = String(cardNo);
    if (Number.isNaN(Number(uid)) || uid <= 0 || uid > 3e3 || userId.length > 9 || name.length > 24 || password.length > 8 || cardNoStr.length > 10) {
      return false;
    }
    const commandBuffer = Buffer.alloc(72);
    commandBuffer.writeUInt16LE(uid, 0);
    commandBuffer.writeUInt16LE(role, 2);
    commandBuffer.write(password, 3, 8);
    commandBuffer.write(name, 11, 24);
    commandBuffer.writeUInt16LE(Number(cardNoStr) || 0, 35);
    commandBuffer.writeUInt32LE(0, 40);
    commandBuffer.write(userId ?? "", 48);
    return this.executeCmd(COMMANDS.CMD_USER_WRQ, commandBuffer);
  }
  async getAttendanceSize() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0)
    );
    return data.readUIntLE(40, 4);
  }
  async clearAttendanceLog() {
    return this.executeCmd(COMMANDS.CMD_CLEAR_ATTLOG, Buffer.alloc(0));
  }
  async getRealTimeLogs(cb = () => {
  }) {
    this.replyId += 1;
    const buffer = createTCPHeader(
      COMMANDS.CMD_REG_EVENT,
      this.sessionId ?? 0,
      this.replyId,
      REQUEST_DATA.GET_REAL_TIME_EVENT
    );
    const socket = this.ensureSocket();
    await new Promise((resolve, reject) => {
      socket.write(buffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    if (socket.listenerCount("data") === 0) {
      socket.on("data", (data) => {
        if (!checkNotEventTCP(data) || data.length <= 16) {
          return;
        }
        cb(decodeRecordRealTimeLog52(data));
      });
    }
  }
  getSocketStatus() {
    return this.socket !== null;
  }
};
var jtcp_default = JTCP;

// src/helper/judp.ts
var import_node_dgram = __toESM(require("dgram"));
var JUDP = class {
  constructor(ip, port, timeout, inboundPort) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.inboundPort = inboundPort;
    this.socket = null;
    this.sessionId = null;
    this.replyId = 0;
  }
  createSocket(cbError, cbClose) {
    return new Promise((resolve, reject) => {
      const socket = import_node_dgram.default.createSocket("udp4");
      socket.setMaxListeners(0);
      this.socket = socket;
      socket.once("error", (err) => {
        cbError?.(err);
        reject(err);
      });
      socket.on("close", () => {
        this.socket = null;
        cbClose?.("udp");
      });
      socket.once("listening", () => {
        resolve(socket);
      });
      try {
        socket.bind(this.inboundPort);
      } catch (err) {
        socket.removeAllListeners();
        cbError?.(err);
        reject(err);
      }
    });
  }
  async connect() {
    const reply = await this.executeCmd(COMMANDS.CMD_CONNECT, Buffer.alloc(0));
    return Boolean(reply);
  }
  async closeSocket() {
    const socket = this.socket;
    if (!socket) {
      return true;
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(true);
      }, 2e3);
      socket.removeAllListeners("message");
      socket.close(() => {
        clearTimeout(timer);
        this.socket = null;
        resolve(true);
      });
    });
  }
  ensureSocket() {
    if (!this.socket) {
      throw new Error("Socket is not initialized. Call createSocket() first.");
    }
    return this.socket;
  }
  executeCmd(command, data) {
    return new Promise(async (resolve, reject) => {
      if (command === COMMANDS.CMD_CONNECT) {
        this.sessionId = 0;
        this.replyId = 0;
      } else {
        this.replyId += 1;
      }
      const buffer = createUDPHeader(
        command,
        this.sessionId ?? 0,
        this.replyId,
        data
      );
      try {
        const reply = await this.writeMessage(
          buffer,
          command === COMMANDS.CMD_CONNECT || command === COMMANDS.CMD_EXIT
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
  writeMessage(msg, connect) {
    return new Promise((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer = null;
      const handleMessage = (data) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener("message", handleMessage);
        resolve(data);
      };
      socket.once("message", handleMessage);
      socket.send(msg, 0, msg.length, this.port, this.ip, (err) => {
        if (err) {
          socket.removeListener("message", handleMessage);
          reject(err);
          return;
        }
        if (this.timeout) {
          timer = setTimeout(
            () => {
              if (timer) {
                clearTimeout(timer);
              }
              socket.removeListener("message", handleMessage);
              reject(new Error("TIMEOUT_ON_WRITING_MESSAGE"));
            },
            connect ? 2e3 : this.timeout
          );
        }
      });
    });
  }
  requestData(msg) {
    return new Promise((resolve, reject) => {
      const socket = this.ensureSocket();
      let timer = null;
      const internalCallback = (data) => {
        if (timer) {
          clearTimeout(timer);
        }
        socket.removeListener("message", handleOnData);
        resolve(data);
      };
      const handleOnData = (data) => {
        if (checkNotEventUDP(data)) {
          return;
        }
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          socket.removeListener("message", handleOnData);
          reject(new Error("TIMEOUT_ON_RECEIVING_REQUEST_DATA"));
        }, this.timeout ?? 0);
        if (data.length >= 13) {
          internalCallback(data);
        }
      };
      socket.on("message", handleOnData);
      socket.send(msg, 0, msg.length, this.port, this.ip, (err) => {
        if (err) {
          socket.removeListener("message", handleOnData);
          reject(err);
          return;
        }
        timer = setTimeout(() => {
          socket.removeListener("message", handleOnData);
          reject(
            new Error("TIMEOUT_IN_RECEIVING_RESPONSE_AFTER_REQUESTING_DATA")
          );
        }, this.timeout ?? 0);
      });
    });
  }
  sendChunkRequest(start, size) {
    this.replyId += 1;
    const reqData = Buffer.alloc(8);
    reqData.writeUInt32LE(start, 0);
    reqData.writeUInt32LE(size, 4);
    const buffer = createUDPHeader(
      COMMANDS.CMD_DATA_RDY,
      this.sessionId ?? 0,
      this.replyId,
      reqData
    );
    const socket = this.ensureSocket();
    socket.send(buffer, 0, buffer.length, this.port, this.ip, (err) => {
      if (err) {
        log(`[UDP][SEND_CHUNK_REQUEST] ${err.toString()}`);
      }
    });
  }
  readWithBuffer(reqData, cb = null) {
    return new Promise(async (resolve, reject) => {
      this.replyId += 1;
      const buffer = createUDPHeader(
        COMMANDS.CMD_DATA_WRRQ,
        this.sessionId ?? 0,
        this.replyId,
        reqData
      );
      let reply;
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
          const timeout = 3e3;
          let timer = null;
          const resetTimer = (cb2, ms = timeout) => {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(cb2, ms);
          };
          const internalCallback = (data, err = null) => {
            if (timer) {
              clearTimeout(timer);
            }
            socket.removeListener("message", handleOnData);
            resolve({ data, err });
          };
          resetTimer(() => {
            internalCallback(
              totalBuffer,
              new Error("TIMEOUT WHEN RECEIVING PACKET")
            );
          });
          const handleOnData = (incoming) => {
            if (checkNotEventUDP(incoming)) {
              return;
            }
            resetTimer(() => {
              internalCallback(
                totalBuffer,
                new Error(
                  `TIMEOUT !! ${(size - totalBuffer.length) / size} % REMAIN !`
                )
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
                  incoming.subarray(8)
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
                      incomingHeader.commandId
                    )}`
                  )
                );
              }
            }
          };
          socket.on("message", handleOnData);
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
              `ERROR_IN_UNHANDLE_CMD ${exportErrorMessage(header.commandId)}`
            )
          );
        }
      }
    });
  }
  async getUsers() {
    if (this.socket) {
      await this.freeData();
    }
    const response = await this.readWithBuffer(REQUEST_DATA.GET_USERS);
    if (this.socket) {
      await this.freeData();
    }
    const USER_PACKET_SIZE = 28;
    let userData = response.data.subarray(4);
    const users = [];
    while (userData.length >= USER_PACKET_SIZE) {
      const user = decodeUserData28(userData.subarray(0, USER_PACKET_SIZE));
      users.push(user);
      userData = userData.subarray(USER_PACKET_SIZE);
    }
    return { data: users, err: response.err };
  }
  async getAttendances(callbackInProcess = () => {
  }) {
    if (this.socket) {
      await this.freeData();
    }
    const response = await this.readWithBuffer(
      REQUEST_DATA.GET_ATTENDANCE_LOGS,
      callbackInProcess
    );
    if (this.socket) {
      await this.freeData();
    }
    const RECORD_PACKET_SIZE = response.mode ? 8 : 16;
    let recordData = response.data.subarray(4);
    const records = [];
    while (recordData.length >= RECORD_PACKET_SIZE) {
      const record = decodeRecordData16(
        recordData.subarray(0, RECORD_PACKET_SIZE)
      );
      records.push({ ...record, ip: this.ip });
      recordData = recordData.subarray(RECORD_PACKET_SIZE);
    }
    return { data: records, err: response.err };
  }
  async freeData() {
    return this.executeCmd(COMMANDS.CMD_FREE_DATA, Buffer.alloc(0));
  }
  async getInfo() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0)
    );
    return {
      userCounts: data.readUIntLE(24, 4),
      logCounts: data.readUIntLE(40, 4),
      logCapacity: data.readUIntLE(72, 4)
    };
  }
  async getTime() {
    const data = await this.executeCmd(COMMANDS.CMD_GET_TIME, Buffer.alloc(0));
    return decode(data.readUInt32LE(8));
  }
  async clearAttendanceLog() {
    return this.executeCmd(COMMANDS.CMD_CLEAR_ATTLOG, Buffer.alloc(0));
  }
  async disableDevice() {
    return this.executeCmd(
      COMMANDS.CMD_DISABLEDEVICE,
      REQUEST_DATA.DISABLE_DEVICE
    );
  }
  async enableDevice() {
    return this.executeCmd(COMMANDS.CMD_ENABLEDEVICE, Buffer.alloc(0));
  }
  async disconnect() {
    try {
      await this.executeCmd(COMMANDS.CMD_EXIT, Buffer.alloc(0));
    } catch (err) {
      log(
        `[UDP][DISCONNECT] ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return this.closeSocket();
  }
  async getSerialNumber() {
    const keyword = "~SerialNumber";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("utf-8").replace(`${keyword}=`, "");
  }
  async getDeviceVersion() {
    const keyword = "~ZKFPVersion";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getDeviceName() {
    const keyword = "~DeviceName";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getPlatform() {
    const keyword = "~Platform";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getOS() {
    const keyword = "~OS";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getWorkCode() {
    const keyword = "WorkCode";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getPIN() {
    const keyword = "~PIN2Width";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getFaceOn() {
    const keyword = "FaceFunOn";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    const value = data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
    return value.includes("0") ? "No" : "Yes";
  }
  async getSSR() {
    const keyword = "~SSR";
    const data = await this.executeCmd(COMMANDS.CMD_OPTIONS_RRQ, keyword);
    return data.subarray(8).toString("ascii").replace(`${keyword}=`, "");
  }
  async getFirmware() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_VERSION,
      Buffer.alloc(0)
    );
    return data.subarray(8).toString("ascii");
  }
  async setUser(uid, userId, name, password, role = 0, cardNo = 0) {
    const cardNoStr = String(cardNo);
    if (Number.isNaN(Number(uid)) || uid <= 0 || uid > 3e3 || userId.length > 9 || name.length > 24 || password.length > 8 || cardNoStr.length > 10) {
      return false;
    }
    const commandBuffer = Buffer.alloc(72);
    commandBuffer.writeUInt16LE(uid, 0);
    commandBuffer.writeUInt16LE(role, 2);
    commandBuffer.write(password, 3, 8);
    commandBuffer.write(name, 11, 24);
    commandBuffer.writeUInt16LE(Number(cardNoStr) || 0, 35);
    commandBuffer.writeUInt32LE(0, 40);
    commandBuffer.write(userId ?? "", 48);
    return this.executeCmd(COMMANDS.CMD_USER_WRQ, commandBuffer);
  }
  async getAttendanceSize() {
    const data = await this.executeCmd(
      COMMANDS.CMD_GET_FREE_SIZES,
      Buffer.alloc(0)
    );
    return data.readUIntLE(40, 4);
  }
  async getRealTimeLogs(cb = () => {
  }) {
    this.replyId += 1;
    const buffer = createUDPHeader(
      COMMANDS.CMD_REG_EVENT,
      this.sessionId ?? 0,
      this.replyId,
      REQUEST_DATA.GET_REAL_TIME_EVENT
    );
    const socket = this.ensureSocket();
    await new Promise((resolve, reject) => {
      socket.send(buffer, 0, buffer.length, this.port, this.ip, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    if (socket.listenerCount("message") < 2) {
      socket.on("message", (data) => {
        if (!checkNotEventUDP(data) || data.length !== 18) {
          return;
        }
        cb(decodeRecordRealTimeLog18(data));
      });
    }
  }
  getSocketStatus() {
    return this.socket !== null;
  }
};
var judp_default = JUDP;

// src/index.ts
var ZKAttendanceClient = class {
  constructor(ip, port = 4370, timeout = 5e3, inboundPort) {
    this.ip = ip;
    this.port = port;
    this.timeout = timeout;
    this.connectionType = null;
    this.interval = null;
    this.timer = null;
    this.isBusy = false;
    const resolvedInboundPort = inboundPort ?? this.port;
    this.jtcp = new jtcp_default(this.ip, this.port, this.timeout);
    this.judp = new judp_default(this.ip, this.port, this.timeout, resolvedInboundPort);
  }
  isErrnoException(err) {
    return Boolean(err && typeof err === "object" && "code" in err);
  }
  async functionWrapper(tcpCallback, udpCallback, command) {
    if (this.isBusy) {
      throw new ZKError(
        new Error("Device is busy, try again later"),
        `[BUSY] ${command}`,
        this.ip
      );
    }
    this.isBusy = true;
    switch (this.connectionType) {
      case "tcp": {
        if (!this.jtcp.getSocketStatus()) {
          this.isBusy = false;
          throw new ZKError(
            new Error("Socket isn't connected !"),
            "[TCP]",
            this.ip
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
      case "udp": {
        if (!this.judp.getSocketStatus()) {
          this.isBusy = false;
          throw new ZKError(
            new Error("Socket isn't connected !"),
            "[UDP]",
            this.ip
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
        throw new ZKError(new Error("Socket isn't connected !"), "", this.ip);
    }
  }
  async safeDisconnectTcp() {
    try {
      await this.jtcp.disconnect();
    } catch {
    }
  }
  async safeDisconnectUdp() {
    try {
      await this.judp.disconnect();
    } catch {
    }
  }
  async createSocket(cbErr, cbClose) {
    if (this.isBusy) {
      throw new ZKError(
        new Error("Device is busy, try again later"),
        "[BUSY] CREATE_SOCKET",
        this.ip
      );
    }
    this.isBusy = true;
    try {
      try {
        if (!this.jtcp.getSocketStatus()) {
          await this.jtcp.createSocket(cbErr, cbClose);
          await this.jtcp.connect();
          console.log("ok tcp");
        }
        this.connectionType = "tcp";
        return;
      } catch (err) {
        await this.safeDisconnectTcp();
        if (!this.isErrnoException(err) || err.code !== "ECONNREFUSED" /* ECONNREFUSED */) {
          throw new ZKError(err, "TCP CONNECT", this.ip);
        }
      }
      try {
        if (!this.judp.getSocketStatus()) {
          await this.judp.createSocket(cbErr, cbClose);
          await this.judp.connect();
          console.log("ok udp");
        }
        this.connectionType = "udp";
      } catch (err) {
        if (this.isErrnoException(err) && err.code === "EADDRINUSE" /* EADDRINUSE */) {
          this.connectionType = "udp";
          return;
        }
        this.connectionType = null;
        await this.safeDisconnectUdp();
        await this.safeDisconnectTcp();
        throw new ZKError(err, "UDP CONNECT", this.ip);
      }
    } finally {
      this.isBusy = false;
    }
  }
  async getUsers() {
    return this.functionWrapper(
      () => this.jtcp.getUsers(),
      () => this.judp.getUsers(),
      "GET_USERS"
    );
  }
  async getTime() {
    return this.functionWrapper(
      () => this.jtcp.getTime(),
      () => this.judp.getTime(),
      "GET_TIME"
    );
  }
  async getSerialNumber() {
    return this.functionWrapper(
      () => this.jtcp.getSerialNumber(),
      () => this.judp.getSerialNumber(),
      "GET_SERIAL_NUMBER"
    );
  }
  async getDeviceVersion() {
    return this.functionWrapper(
      () => this.jtcp.getDeviceVersion(),
      () => this.judp.getDeviceVersion(),
      "GET_DEVICE_VERSION"
    );
  }
  async getDeviceName() {
    return this.functionWrapper(
      () => this.jtcp.getDeviceName(),
      () => this.judp.getDeviceName(),
      "GET_DEVICE_NAME"
    );
  }
  async getPlatform() {
    return this.functionWrapper(
      () => this.jtcp.getPlatform(),
      () => this.judp.getPlatform(),
      "GET_PLATFORM"
    );
  }
  async getOS() {
    return this.functionWrapper(
      () => this.jtcp.getOS(),
      () => this.judp.getOS(),
      "GET_OS"
    );
  }
  async getWorkCode() {
    return this.functionWrapper(
      () => this.jtcp.getWorkCode(),
      () => this.judp.getWorkCode(),
      "GET_WORK_CODE"
    );
  }
  async getPIN() {
    return this.functionWrapper(
      () => this.jtcp.getPIN(),
      () => this.judp.getPIN(),
      "GET_PIN"
    );
  }
  async getFaceOn() {
    return this.functionWrapper(
      () => this.jtcp.getFaceOn(),
      () => this.judp.getFaceOn(),
      "GET_FACE_ON"
    );
  }
  async getSSR() {
    return this.functionWrapper(
      () => this.jtcp.getSSR(),
      () => this.judp.getSSR(),
      "GET_SSR"
    );
  }
  async getFirmware() {
    return this.functionWrapper(
      () => this.jtcp.getFirmware(),
      () => this.judp.getFirmware(),
      "GET_FIRMWARE"
    );
  }
  async setUser(uid, userId, name, password, role = 0, cardNo = 0) {
    return this.functionWrapper(
      () => this.jtcp.setUser(uid, userId, name, password, role, cardNo),
      () => this.judp.setUser(uid, userId, name, password, role, cardNo),
      "SET_USER"
    );
  }
  async getAttendanceSize() {
    return this.functionWrapper(
      () => this.jtcp.getAttendanceSize(),
      () => this.judp.getAttendanceSize(),
      "GET_ATTENDANCE_SIZE"
    );
  }
  async getAttendances(cb) {
    return this.functionWrapper(
      () => this.jtcp.getAttendances(cb),
      () => this.judp.getAttendances(cb),
      "GET_ATTENDANCES"
    );
  }
  async getRealTimeLogs(cb) {
    return this.functionWrapper(
      () => this.jtcp.getRealTimeLogs(cb),
      () => this.judp.getRealTimeLogs(cb),
      "GET_REAL_TIME_LOGS"
    );
  }
  async disconnect() {
    const result = await this.functionWrapper(
      () => this.jtcp.disconnect(),
      () => this.judp.disconnect(),
      "DISCONNECT"
    );
    this.connectionType = null;
    return result;
  }
  async freeData() {
    return this.functionWrapper(
      () => this.jtcp.freeData(),
      () => this.judp.freeData(),
      "FREE_DATA"
    );
  }
  async disableDevice() {
    return this.functionWrapper(
      () => this.jtcp.disableDevice(),
      () => this.judp.disableDevice(),
      "DISABLE_DEVICE"
    );
  }
  async enableDevice() {
    return this.functionWrapper(
      () => this.jtcp.enableDevice(),
      () => this.judp.enableDevice(),
      "ENABLE_DEVICE"
    );
  }
  async getInfo() {
    return this.functionWrapper(
      () => this.jtcp.getInfo(),
      () => this.judp.getInfo(),
      "GET_INFO"
    );
  }
  async getSocketStatus() {
    return this.functionWrapper(
      async () => this.jtcp.getSocketStatus(),
      async () => this.judp.getSocketStatus(),
      "GET_SOCKET_STATUS"
    );
  }
  async clearAttendanceLog() {
    return this.functionWrapper(
      () => this.jtcp.clearAttendanceLog(),
      () => this.judp.clearAttendanceLog(),
      "CLEAR_ATTENDANCE_LOG"
    );
  }
  async executeCmd(command, data = "") {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(command, data),
      () => this.judp.executeCmd(command, data),
      "EXECUTE_CMD"
    );
  }
  setIntervalSchedule(cb, timer) {
    this.interval = setInterval(cb, timer);
  }
  setTimerSchedule(cb, timer) {
    this.timer = setTimeout(cb, timer);
  }
  clearIntervalSchedule() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  clearTimerSchedule() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  isConnected() {
    if (this.connectionType === "tcp") {
      return this.jtcp.getSocketStatus();
    }
    if (this.connectionType === "udp") {
      return this.judp.getSocketStatus();
    }
    return false;
  }
  getConnectionType() {
    return this.connectionType;
  }
  async setTime(date = /* @__PURE__ */ new Date()) {
    const payload = Buffer.alloc(4);
    payload.writeUInt32LE(encode(date), 0);
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_SET_TIME, payload),
      () => this.judp.executeCmd(COMMANDS.CMD_SET_TIME, payload),
      "SET_TIME"
    );
  }
  async deleteUser(uid) {
    const userId = typeof uid === "string" ? Number.parseInt(uid, 10) : uid;
    if (Number.isNaN(userId)) {
      throw new ZKError(new Error("Invalid user id"), "DELETE_USER", this.ip);
    }
    const payload = Buffer.alloc(2);
    payload.writeUInt16LE(userId, 0);
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_DELETE_USER, payload),
      () => this.judp.executeCmd(COMMANDS.CMD_DELETE_USER, payload),
      "DELETE_USER"
    );
  }
  async restart() {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_RESTART, Buffer.alloc(0)),
      () => this.judp.executeCmd(COMMANDS.CMD_RESTART, Buffer.alloc(0)),
      "RESTART"
    );
  }
  async powerOff() {
    return this.functionWrapper(
      () => this.jtcp.executeCmd(COMMANDS.CMD_POWEROFF, Buffer.alloc(0)),
      () => this.judp.executeCmd(COMMANDS.CMD_POWEROFF, Buffer.alloc(0)),
      "POWER_OFF"
    );
  }
};
var index_default = ZKAttendanceClient;
//# sourceMappingURL=index.js.map