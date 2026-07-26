import { EventEmitter } from 'node:events';
import JTCP from '../src/helper/jtcp';
import { noopLogger } from '../src/logger';

class FakeTcpSocket extends EventEmitter {
  write(_data: Buffer, cb?: (err?: Error) => void): boolean {
    cb?.(new Error('boom'));
    return true;
  }
}

describe('JTCP logger injection', () => {
  test('noopLogger methods do nothing', () => {
    expect(() => noopLogger.warn('x')).not.toThrow();
    expect(() => noopLogger.error('x')).not.toThrow();
  });

  test('calls the injected logger.error on write failure instead of the default file logger', () => {
    const errors: string[] = [];
    const logger = { warn: () => {}, error: (msg: string) => errors.push(msg) };
    const jtcp = new JTCP('10.0.0.1', 4370, 5000, logger);
    (jtcp as unknown as { socket: FakeTcpSocket }).socket = new FakeTcpSocket();

    jtcp.sendChunkRequest(0, 100);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('[TCP][SEND_CHUNK_REQUEST]');
  });
});
