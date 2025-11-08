/*
  Basic usage example for the ZK Attendance SDK.
  Override defaults with:
    - ZK_DEVICE_IP
    - ZK_DEVICE_PORT
    - ZK_DEVICE_TIMEOUT
*/

/* eslint-disable no-console */

import ZKAttendanceClient from '../src/index';

const DEVICE_IP = process.env.ZK_DEVICE_IP ?? '192.168.1.106';
const DEVICE_PORT = Number(process.env.ZK_DEVICE_PORT ?? 4370);
const SOCKET_TIMEOUT = Number(process.env.ZK_DEVICE_TIMEOUT ?? 5000);

const formatSection = (title: string): void => {
  const line = '-'.repeat(title.length + 4);
  console.log(`\n${line}`);
  console.log(`| ${title} |`);
  console.log(line);
};

const basicUsage = async (): Promise<void> => {
  const client = new ZKAttendanceClient(DEVICE_IP, DEVICE_PORT, SOCKET_TIMEOUT);

  try {
    formatSection('Connecting');
    await client.createSocket(
      err => console.error('Socket error:', err),
      protocol => console.log(`Socket closed (${protocol})`),
    );
    console.log('Connected via', client.getConnectionType());

    formatSection('Device Info');
    const info = await client.getInfo();
    console.dir(info, { depth: null });

    formatSection('Users');
    const users = await client.getUsers();
    console.log(`Total: ${users.data.length}`);

    formatSection('Attendance Logs');
    const logs = await client.getAttendances((received, total) => {
      process.stdout.write(`\rDownloading logs ${received}/${total} bytes`);
    });
    process.stdout.write('\n');
    console.log(`Total records: ${logs.data.length}`);

    formatSection('Cleanup');
    await client.freeData();
    await client.disconnect();
    console.log('Disconnected cleanly');
  } catch (error) {
    console.error('\nExample failed:', error);
    try {
      await client.disconnect();
    } catch (disconnectError) {
      console.error('Failed to disconnect:', disconnectError);
    }
  }
};

basicUsage();
