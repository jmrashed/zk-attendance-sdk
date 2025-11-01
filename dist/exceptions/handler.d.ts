declare enum ERROR_TYPES {
    ECONNRESET = "ECONNRESET",
    ECONNREFUSED = "ECONNREFUSED",
    EADDRINUSE = "EADDRINUSE",
    ETIMEDOUT = "ETIMEDOUT"
}
type ErrWithCode = Error & {
    code?: string;
};
declare class ZKError {
    private readonly err;
    private readonly command;
    private readonly ip;
    constructor(err: ErrWithCode, command: string, ip: string);
    toast(): string;
    getError(): {
        err: {
            message: string;
            code: string | undefined;
        };
        ip: string;
        command: string;
    };
}
export { ERROR_TYPES, ZKError };
