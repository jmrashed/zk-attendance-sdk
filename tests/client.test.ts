import assert from 'node:assert';
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

async function testConstructorDefaults() {
  const defaultClient = new ZKAttendanceClient('10.0.0.1');
  const defaultInternals = getInternals(defaultClient);

  assert.strictEqual(defaultInternals.port, 4370, 'Expected default port 4370');
  assert.strictEqual(
    defaultInternals.timeout,
    5000,
    'Expected default timeout 5000ms',
  );
  assert.strictEqual(
    defaultInternals.judp.inboundPort,
    4370,
    'Inbound UDP port should fall back to the device port',
  );

  const customClient = new ZKAttendanceClient('10.0.0.1', 5005, 7000, 6001);
  const customInternals = getInternals(customClient);

  assert.strictEqual(
    customInternals.port,
    5005,
    'Custom port should be applied',
  );
  assert.strictEqual(
    customInternals.timeout,
    7000,
    'Custom timeout should be applied',
  );
  assert.strictEqual(
    customInternals.judp.inboundPort,
    6001,
    'Custom inbound port should override defaults',
  );
}

async function testBusyStatePreventsConcurrentCalls() {
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

  // Maintain UDP stub to satisfy functionWrapper even if connection switches
  internals.judp = {
    inboundPort: internals.judp.inboundPort,
    getSocketStatus: () => true,
    getUsers: async () => ({ data: [] }),
  };

  const firstCall = client.getUsers();

  await assert.rejects(
    client.getUsers(),
    (err: unknown) =>
      err instanceof ZKError &&
      err.toast() === 'Device is busy, try again later',
    'Concurrent call should throw a busy-state ZKError',
  );

  const firstResult = await firstCall;
  assert.deepStrictEqual(
    firstResult,
    { data: ['call-1'] },
    'First call should resolve correctly',
  );

  const secondResult = await client.getUsers();
  assert.deepStrictEqual(
    secondResult,
    { data: ['call-2'] },
    'Subsequent call should succeed after busy flag resets',
  );
}

async function testBusyResetsAfterFailure() {
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

  await assert.rejects(
    client.getUsers(),
    (err: unknown) => err instanceof ZKError && err.toast() === 'boom',
    'Errors should be surfaced through ZKError with original message',
  );

  const result = await client.getUsers();
  assert.deepStrictEqual(
    result,
    { data: ['ok'] },
    'Busy flag should clear after an error',
  );
}

async function run() {
  await testConstructorDefaults();
  await testBusyStatePreventsConcurrentCalls();
  await testBusyResetsAfterFailure();
  // eslint-disable-next-line no-console
  console.log('✅  All tests passed');
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error('❌  Tests failed');
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
