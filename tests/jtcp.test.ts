import { EventEmitter } from 'node:events';
import { COMMANDS } from '../src/constants/command';
import JTCP from '../src/helper/jtcp';

class FakeTcpSocket extends EventEmitter {
  write(data: Buffer, cb?: (err?: Error) => void): boolean {
    cb?.();
    return true;
  }
}

function buildTcpReply(
  commandId: number,
  payload: Buffer = Buffer.alloc(0),
  sessionId = 1,
  replyId = 1,
): Buffer {
  const inner = Buffer.alloc(8 + payload.length);
  inner.writeUInt16LE(commandId, 0);
  inner.writeUInt16LE(0, 2);
  inner.writeUInt16LE(sessionId, 4);
  inner.writeUInt16LE(replyId, 6);
  payload.copy(inner, 8);

  const prefix = Buffer.from([0x50, 0x50, 0x82, 0x7d, 0x00, 0x00, 0x00, 0x00]);
  prefix.writeUInt16LE(inner.length, 4);
  return Buffer.concat([prefix, inner]);
}

function withFakeSocket(jtcp: JTCP): FakeTcpSocket {
  const socket = new FakeTcpSocket();
  (jtcp as unknown as { socket: FakeTcpSocket }).socket = socket;
  return socket;
}

describe('JTCP executeCmd ACK validation', () => {
  test('resolves normally on CMD_ACK_OK', async () => {
    const jtcp = new JTCP('10.0.0.1', 4370, 1000);
    const socket = withFakeSocket(jtcp);

    const promise = jtcp.disableDevice();
    socket.emit('data', buildTcpReply(COMMANDS.CMD_ACK_OK));

    await expect(promise).resolves.toBeInstanceOf(Buffer);
  });

  test('rejects when device replies with CMD_ACK_ERROR', async () => {
    const jtcp = new JTCP('10.0.0.1', 4370, 1000);
    const socket = withFakeSocket(jtcp);

    const promise = jtcp.disableDevice();
    socket.emit('data', buildTcpReply(COMMANDS.CMD_ACK_ERROR));

    await expect(promise).rejects.toThrow(/CMD_ACK_ERROR/);
  });

  test('rejects when device replies with CMD_ACK_UNAUTH', async () => {
    const jtcp = new JTCP('10.0.0.1', 4370, 1000);
    const socket = withFakeSocket(jtcp);

    const promise = jtcp.disableDevice();
    socket.emit('data', buildTcpReply(COMMANDS.CMD_ACK_UNAUTH));

    await expect(promise).rejects.toThrow(/CMD_ACK_UNAUTH/);
  });
});
