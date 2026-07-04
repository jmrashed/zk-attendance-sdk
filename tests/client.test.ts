import { ZKError } from '../src/exceptions/handler';
import ZKAttendanceClient from '../src/index';

// Internal shape helper purely for tests (relies on TS private fields compiling to plain props)
type ClientInternals = {
  port: number;
  timeout: number;
  judp: {
    inboundPort: number;
    getSocketStatus(): boolean;
    getUsers?: () => Promise<unknown>;
  };
  jtcp: {
    getSocketStatus(): boolean;
    getUsers: () => Promise<unknown>;
  };
  connectionType: 'tcp' | 'udp' | null;
};

function getInternals(client: ZKAttendanceClient): ClientInternals {
  return client as unknown as ClientInternals;
}

describe('ZKAttendanceClient (unit)', () => {
  test('constructor defaults', () => {
    const defaultClient = new ZKAttendanceClient('10.0.0.1');
    const defaultInternals = getInternals(defaultClient);

    expect(defaultInternals.port).toBe(4370);
    expect(defaultInternals.timeout).toBe(5000);
    expect(defaultInternals.judp.inboundPort).toBe(4370);

    const customClient = new ZKAttendanceClient('10.0.0.1', 5005, 7000, 6001);
    const customInternals = getInternals(customClient);

    expect(customInternals.port).toBe(5005);
    expect(customInternals.timeout).toBe(7000);
    expect(customInternals.judp.inboundPort).toBe(6001);
  });

  test('busy state prevents concurrent calls', async () => {
    const client = new ZKAttendanceClient('10.0.0.1');
    const internals = getInternals(client);
    internals.connectionType = 'tcp';

    let callCounter = 0;
    internals.jtcp = {
      getSocketStatus: () => true,
      getUsers: () =>
        new Promise(resolve => {
          setTimeout(() => {
            callCounter += 1;
            resolve({ data: [`call-${callCounter}`] });
          }, 25);
        }),
    };

    internals.judp = {
      inboundPort: internals.judp.inboundPort,
      getSocketStatus: () => true,
      getUsers: async () => ({ data: [] }),
    };

    const firstCall = client.getUsers();

    try {
      await client.getUsers();
      throw new Error('Expected getUsers() to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ZKError);
      expect((err as ZKError).toast()).toBe('Device is busy, try again later');
    }

    await expect(firstCall).resolves.toEqual({ data: ['call-1'] });
    await expect(client.getUsers()).resolves.toEqual({ data: ['call-2'] });
  });

  test('busy flag resets after failure', async () => {
    const client = new ZKAttendanceClient('10.0.0.1');
    const internals = getInternals(client);
    internals.connectionType = 'tcp';

    let shouldFail = true;
    internals.jtcp = {
      getSocketStatus: () => true,
      getUsers: async () => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('boom');
        }
        return { data: ['ok'] };
      },
    };

    internals.judp = {
      inboundPort: internals.judp.inboundPort,
      getSocketStatus: () => true,
      getUsers: async () => ({ data: [] }),
    };

    try {
      await client.getUsers();
      throw new Error('Expected getUsers() to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ZKError);
      expect((err as ZKError).toast()).toBe('boom');
    }

    await expect(client.getUsers()).resolves.toEqual({ data: ['ok'] });
  });
});
