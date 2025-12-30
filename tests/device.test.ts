import { ZKError } from '../src/exceptions/handler';
import ZKAttendanceClient from '../src/index';

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid env var ${name}=${raw} (expected integer)`);
  }
  return value;
}

function getDeviceConfig(): {
  ip: string;
  port: number;
  timeout: number;
  inboundPort: number;
} {
  const ip = process.env.ZK_DEVICE_IP ?? '';
  if (!ip) {
    throw new Error('Missing env var ZK_DEVICE_IP');
  }

  const port = readNumberEnv('ZK_DEVICE_PORT', 4370);
  const timeout = readNumberEnv('ZK_DEVICE_TIMEOUT', 5000);

  // Important: for UDP, binding to 4370 can fail (EADDRINUSE). Using 0 lets the OS pick a free port.
  const inboundPort = readNumberEnv('ZK_DEVICE_INBOUND_PORT', 0);

  return { ip, port, timeout, inboundPort };
}

async function withConnectedClient<T>(
  fn: (client: ZKAttendanceClient) => Promise<T>,
): Promise<T> {
  const { ip, port, timeout, inboundPort } = getDeviceConfig();
  const client = new ZKAttendanceClient(ip, port, timeout, inboundPort);

  await client.createSocket();
  expect(client.isConnected()).toBe(true);

  try {
    return await fn(client);
  } finally {
    // Best-effort cleanup; do not mask test failures.
    try {
      await client.disconnect();
    } catch {
      // ignore
    }
  }
}

async function testConnectAndReadOnlyCalls() {
  await withConnectedClient(async client => {
    const t = await client.getTime();
    expect(t).toBeInstanceOf(Date);

    // getUsers is also read-only, but can be heavier; keep it optional.
    if (process.env.ZK_DEVICE_TEST_USERS === '1') {
      const users = await client.getUsers();
      const data = (users as { data?: unknown }).data;
      expect(Array.isArray(data)).toBe(true);
    }
  });
}

async function testBusyStateWithRealDevice() {
  await withConnectedClient(async client => {
    const first = client.getTime();

    try {
      await client.getTime();
      throw new Error('Expected getTime() to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ZKError);
      expect((err as ZKError).toast()).toBe('Device is busy, try again later');
    }

    const firstResult = await first;
    expect(firstResult).toBeInstanceOf(Date);

    const secondResult = await client.getTime();
    expect(secondResult).toBeInstanceOf(Date);
  });
}

function formatUserRow(user: unknown): string {
  if (!user || typeof user !== 'object') {
    return String(user);
  }

  const record = user as Record<string, unknown>;
  const pick = (key: string): string | undefined => {
    const value = record[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return JSON.stringify(value);
  };

  const userId =
    pick('userId') ??
    pick('userid') ??
    pick('id') ??
    pick('uid') ??
    pick('PIN') ??
    pick('pin');
  const name = pick('name') ?? pick('username');
  const role = pick('role') ?? pick('privilege');
  const cardNo = pick('cardNo') ?? pick('cardno') ?? pick('card');

  const parts = [
    userId ? `userId=${userId}` : undefined,
    name ? `name=${name}` : undefined,
    role ? `role=${role}` : undefined,
    cardNo ? `cardNo=${cardNo}` : undefined,
  ].filter(Boolean);

  return parts.length ? parts.join(' ') : JSON.stringify(record);
}

function shouldFilterUserBecauseNameEqualsUserId(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;

  const normalizeComparable = (value: string): string => {
    // Remove common invisible/control chars that can appear from binary decoding,
    // then normalize Unicode for stable comparisons.
    const withoutControls = value
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

    try {
      return withoutControls.normalize('NFKC');
    } catch {
      return withoutControls;
    }
  };

  const record = user as Record<string, unknown>;
  const pick = (key: string): string | undefined => {
    const value = record[key];
    if (value === undefined || value === null) return undefined;
    return String(value);
  };

  const userId =
    pick('userId') ??
    pick('userid') ??
    pick('id') ??
    pick('uid') ??
    pick('PIN') ??
    pick('pin');
  const name = pick('name') ?? pick('username');

  if (!userId || !name) return false;

  return normalizeComparable(name) === normalizeComparable(userId);
}

function isValidEnrolledUserRow(user: unknown): boolean {
  if (!user || typeof user !== 'object') return false;

  const record = user as Record<string, unknown>;
  const pick = (key: string): string | undefined => {
    const value = record[key];
    if (value === undefined || value === null) return undefined;
    return String(value);
  };

  const normalizeComparable = (value: string): string =>
    value
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();

  const userId =
    pick('userId') ??
    pick('userid') ??
    pick('id') ??
    pick('uid') ??
    pick('PIN') ??
    pick('pin');
  const name = pick('name') ?? pick('username');

  if (!userId || !name) return false;

  // Must be non-empty after stripping invisible/control characters.
  if (!normalizeComparable(userId)) return false;
  if (!normalizeComparable(name)) return false;

  return true;
}

async function testListEnrolledUsers() {
  await withConnectedClient(async client => {
    const result = await client.getUsers();

    // UDP variant returns { data, err }, TCP variant returns { data }.
    const maybeErr = (result as { err?: unknown }).err;
    if (maybeErr) {
      throw maybeErr instanceof Error ? maybeErr : new Error(String(maybeErr));
    }

    const data = (result as { data?: unknown }).data;
    if (!Array.isArray(data)) {
      throw new Error('Expected getUsers() to return { data: [] }');
    }

    const valid = data.filter((user: unknown) => isValidEnrolledUserRow(user));
    const filtered = valid.filter(
      (user: unknown) => !shouldFilterUserBecauseNameEqualsUserId(user),
    );

    const limitRaw = process.env.ZK_DEVICE_LIST_USERS_LIMIT;
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 0;
    const effectiveLimit = Number.isNaN(limit) ? 0 : limit;

    const rows =
      effectiveLimit > 0 ? filtered.slice(0, effectiveLimit) : filtered;

    // Optional debug output (off by default)
    if (process.env.ZK_DEVICE_LIST_USERS_OUTPUT === '1') {
      // eslint-disable-next-line no-console
      console.log(
        `\n📇 Enrolled users: ${filtered.length} (removed ${data.length - valid.length} invalid, removed ${valid.length - filtered.length} name==userId)`,
      );

      rows.forEach((user: unknown, index: number) => {
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${formatUserRow(user)}`);
      });

      if (effectiveLimit > 0 && filtered.length > effectiveLimit) {
        // eslint-disable-next-line no-console
        console.log(
          `... truncated (set ZK_DEVICE_LIST_USERS_LIMIT=0 to print all)`,
        );
      }
    }

    expect(filtered.length).toBeGreaterThanOrEqual(0);
    expect(rows.length).toBeLessThanOrEqual(filtered.length);
  });
}

export async function runDeviceIntegrationTests(): Promise<void> {
  if (!process.env.ZK_DEVICE_IP) {
    return;
  }

  await testConnectAndReadOnlyCalls();
  await testBusyStateWithRealDevice();

  if (process.env.ZK_DEVICE_LIST_USERS === '1') {
    await testListEnrolledUsers();
  }
}

const hasDevice = Boolean(process.env.ZK_DEVICE_IP);

(hasDevice ? describe : describe.skip)('ZKAttendanceClient (device)', () => {
  test('connect and read-only calls', async () => {
    await testConnectAndReadOnlyCalls();
  });

  test('busy state prevents concurrent calls', async () => {
    await testBusyStateWithRealDevice();
  });

  (process.env.ZK_DEVICE_LIST_USERS === '1' ? test : test.skip)(
    'list enrolled users (prints output)',
    async () => {
      await testListEnrolledUsers();
    },
  );
});
