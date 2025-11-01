"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZKError = exports.ERROR_TYPES = void 0;
var ERROR_TYPES;
(function (ERROR_TYPES) {
    ERROR_TYPES["ECONNRESET"] = "ECONNRESET";
    ERROR_TYPES["ECONNREFUSED"] = "ECONNREFUSED";
    ERROR_TYPES["EADDRINUSE"] = "EADDRINUSE";
    ERROR_TYPES["ETIMEDOUT"] = "ETIMEDOUT";
})(ERROR_TYPES || (exports.ERROR_TYPES = ERROR_TYPES = {}));
class ZKError {
    constructor(err, command, ip) {
        this.err = err;
        this.command = command;
        this.ip = ip;
    }
    toast() {
        if (this.err.code === ERROR_TYPES.ECONNRESET) {
            return 'Another device is connecting to the device so the connection is interrupted';
        }
        else if (this.err.code === ERROR_TYPES.ECONNREFUSED) {
            return 'IP of the device is refused';
        }
        else {
            return this.err.message;
        }
    }
    getError() {
        return {
            err: {
                message: this.err.message,
                code: this.err.code,
            },
            ip: this.ip,
            command: this.command,
        };
    }
}
exports.ZKError = ZKError;
//# sourceMappingURL=handler.js.map