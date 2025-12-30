/*
  Real-time attendance listener that writes events as JSON Lines and performs log rotation.
  Override defaults with:
    - ZK_DEVICE_IP
    - ZK_DEVICE_PORT
    - ZK_DEVICE_TIMEOUT
    - ZK_DEVICE_INBOUND_PORT
    - ZK_LOG_FILE
    - ZK_LOG_MAX_BYTES
*/

/* eslint-disable no-console */
import { appendFile, mkdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import ZKAttendanceClient from '../src/index';

const DEVICE_IP = process.env.ZK_DEVICE_IP ?? '192.168.1.106';
const DEVICE_PORT = Number(process.env.ZK_DEVICE_PORT ?? 4370);
const SOCKET_TIMEOUT = Number(process.env.ZK_DEVICE_TIMEOUT ?? 5000);
const INBOUND_PORT = Number(process.env.ZK_DEVICE_INBOUND_PORT ?? DEVICE_PORT);
const LOG_FILE =
  process.env.ZK_LOG_FILE ??
  path.join(process.cwd(), 'logs', 'realtime-events.log');
const MAX_LOG_BYTES = Number(process.env.ZK_LOG_MAX_BYTES ?? 5 * 1024 * 1024);

const rotateLogIfNeeded = async (): Promise<void> => {
  if (!Number.isFinite(MAX_LOG_BYTES) || MAX_LOG_BYTES <= 0) {
    return;
  }

  try {
    const stats = await stat(LOG_FILE);
    if (stats.size < MAX_LOG_BYTES) {
      return;
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw err;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const { dir, name, ext } = path.parse(LOG_FILE);
  const rotatedName = ext
    ? `${name}-${timestamp}${ext}`
    : `${name}-${timestamp}`;
  const targetPath = path.join(dir, rotatedName);

  try {
    await rename(LOG_FILE, targetPath);
    console.log('Rotated log file to', targetPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to rotate log file:', err);
    }
  }
};

type LoggedEvent = {
  userId: string | number | undefined;
  timestamp: Date;
};

const appendEvent = async (event: LoggedEvent): Promise<void> => {
  const record = {
    receivedAt: new Date().toISOString(),
    ...event,
  };
  const line = `${JSON.stringify(record)}\n`;

  try {
    await mkdir(path.dirname(LOG_FILE), { recursive: true });
    await rotateLogIfNeeded();
    await appendFile(LOG_FILE, line, 'utf8');
  } catch (err) {
    console.error('Failed to write event:', err);
  }
};

const main = async (): Promise<void> => {
  const client = new ZKAttendanceClient(
    DEVICE_IP,
    DEVICE_PORT,
    SOCKET_TIMEOUT,
    INBOUND_PORT,
  );

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\nReceived ${signal}. Closing socket...`);
    try {
      await client.disconnect();
    } catch (err) {
      console.error('Error while disconnecting:', err);
    } finally {
      process.exit(0);
    }
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  type RealTimeLog = Parameters<
    NonNullable<Parameters<ZKAttendanceClient['getRealTimeLogs']>[0]>
  >[0];

  try {
    await client.createSocket();
    console.log('Listening for real-time logs on', DEVICE_IP);

    await client.getRealTimeLogs(async (log: RealTimeLog) => {
      const printableTime =
        log.attTime instanceof Date
          ? log.attTime.toISOString()
          : String(log.attTime);
      console.log(
        `Real-time event -> user: ${log.userId ?? 'unknown'}, time: ${printableTime}`,
      );
      await appendEvent({
        userId: log.userId,
        timestamp: log.attTime,
      });
    });

    console.log('Press Ctrl+C to stop');
  } catch (error) {
    console.error('Real-time listener failed:', error);
    await shutdown('error');
  }
};

main();
