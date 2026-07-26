import { log } from './logs/log';

export interface ZKLogger {
  warn: (message: string) => void;
  error: (message: string) => void;
}

/** Default logger: does nothing. No files are written unless a logger is explicitly provided. */
export const noopLogger: ZKLogger = {
  warn: () => {},
  error: () => {},
};

/** Opt-in logger that preserves the SDK's pre-2.3.0 behavior of appending errors to a dated local file. */
export const fileLogger: ZKLogger = {
  warn: (message: string) => log(message),
  error: (message: string) => log(message),
};
