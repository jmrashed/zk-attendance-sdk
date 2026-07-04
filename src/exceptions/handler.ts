enum ERROR_TYPES {
  ECONNRESET = 'ECONNRESET',
  ECONNREFUSED = 'ECONNREFUSED',
  EADDRINUSE = 'EADDRINUSE',
  ETIMEDOUT = 'ETIMEDOUT',
}

class ZKError {
  constructor(
    private readonly err: unknown,
    private readonly command: string,
    private readonly ip: string,
  ) {}

  private getNormalizedError(): Error {
    return this.err instanceof Error ? this.err : new Error(String(this.err));
  }

  private isErrorWithCode(err: unknown): err is { code: string } {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      typeof (err as { code: unknown }).code === 'string'
    );
  }

  /** Generates a user-friendly error message. */
  toast() {
    if (this.isErrorWithCode(this.err)) {
      if (this.err.code === ERROR_TYPES.ECONNRESET) {
        return 'Another device is connecting to the device so the connection is interrupted';
      }
      if (this.err.code === ERROR_TYPES.ECONNREFUSED) {
        return 'IP of the device is refused';
      }
      return this.getNormalizedError().message;
    }
    return this.getNormalizedError().message;
  }

  /** Gets the error details. */
  getError() {
    const normalized = this.getNormalizedError();
    let code: string | undefined;
    if (this.isErrorWithCode(this.err)) {
      code = this.err.code;
    }
    return {
      err: {
        message: normalized.message,
        code,
      },
      ip: this.ip,
      command: this.command,
    };
  }
}

export { ERROR_TYPES, ZKError };
