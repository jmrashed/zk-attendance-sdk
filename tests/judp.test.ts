import { EventEmitter } from 'node:events';
import { COMMANDS } from '../src/constants/command';
import JUDP from '../src/helper/judp';

class FakeUdpSocket extends EventEmitter {
  send(
    _msg: Buffer,
    _offset: number,
    _length: number,
    _port: number,
    _address: string,
    cb?: (err?: Error) => void,
  ): void {
    cb?.();
  }
}

function buildUdpReply(
  commandId: number,
  payload: Buffer = Buffer.alloc(0),
  sessionId = 1,
  replyId = 1,
): Buffer {
  const buf = Buffer.alloc(8 + payload.length);
  buf.writeUInt16LE(commandId, 0);
  buf.writeUInt16LE(0, 2);
  buf.writeUInt16LE(sessionId, 4);
  buf.writeUInt16LE(replyId, 6);
  payload.copy(buf, 8);
  return buf;
}

function withFakeSocket(judp: JUDP): FakeUdpSocket {
  const socket = new FakeUdpSocket();
  (judp as unknown as { socket: FakeUdpSocket }).socket = socket;
  return socket;
}

describe('JUDP executeCmd ACK validation', () => {
  test('resolves normally on CMD_ACK_OK', async () => {
    const judp = new JUDP('10.0.0.1', 4370, 1000, 0);
    const socket = withFakeSocket(judp);

    const promise = judp.disableDevice();
    socket.emit('message', buildUdpReply(COMMANDS.CMD_ACK_OK));

    await expect(promise).resolves.toBeInstanceOf(Buffer);
  });

  test('rejects when device replies with CMD_ACK_ERROR', async () => {
    const judp = new JUDP('10.0.0.1', 4370, 1000, 0);
    const socket = withFakeSocket(judp);

    const promise = judp.disableDevice();
    socket.emit('message', buildUdpReply(COMMANDS.CMD_ACK_ERROR));

    await expect(promise).rejects.toThrow(/CMD_ACK_ERROR/);
  });
});
