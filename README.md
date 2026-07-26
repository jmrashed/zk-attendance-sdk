# ZK Attendance SDK

[![npm version](https://badge.fury.io/js/zk-attendance-sdk.svg)](https://badge.fury.io/js/zk-attendance-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/zk-attendance-sdk.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/zk-attendance-sdk.svg)](https://www.npmjs.com/package/zk-attendance-sdk)

A powerful Node.js SDK for integrating with ZK BioMetric Fingerprint Attendance Devices. This library provides a simple and intuitive API to communicate with ZKTeco devices for attendance management systems.

## ✨ Features

- 🔌 **Easy Connection**: Simple TCP/UDP socket connection to ZK devices
- 👥 **User Management**: Add, retrieve, and manage users on the device
- 📊 **Attendance Logs**: Fetch attendance records and real-time monitoring
- 🔧 **Device Control**: Get device information, enable/disable device functions
- ⚡ **Real-time Events**: Listen to real-time attendance events
- 🛡️ **Error Handling**: Comprehensive error handling and connection management

## 📦 Installation

```bash
npm install zk-attendance-sdk
```

```bash
yarn add zk-attendance-sdk
```

```bash
pnpm add zk-attendance-sdk
```

## 🚀 Quick Start

```typescript
import ZKAttendanceClient from 'zk-attendance-sdk';

const client = new ZKAttendanceClient('192.168.1.106', 4370, 5200, 5000);

async function main(): Promise<void> {
  try {
    // Connect to device
    await client.createSocket();
    console.log('Connected to device');

    // Get device information
    const info = await client.getInfo();
    console.log('Device Info:', info);

    // Get all users
    const users = await client.getUsers();
    console.log('Total Users:', users.data.length);

    // Get attendance logs
    const logs = await client.getAttendances();
    console.log('Total Logs:', logs.data.length);

    // Disconnect
    await client.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 📖 API Reference

### Connection Methods

| Method | Description |
|--------|-------------|
| `createSocket()` | Establishes connection to the device |
| `disconnect()` | Closes connection to the device |
| `isConnected()` | Checks if device is connected |
| `getConnectionType()` | Returns connection type (tcp/udp) |
| `getSocketStatus()` | Returns socket status |

### User Management

| Method | Parameters | Description |
|--------|------------|-------------|
| `getUsers()` | - | Retrieves all users from device |
| `setUser()` | `uid, userid, name, password, role, cardno` | Adds new user to device |
| `deleteUser()` | `uid` | Deletes user from device |

### Attendance Management

| Method | Parameters | Description |
|--------|------------|-------------|
| `getAttendances()` | `callback?` | Retrieves all attendance logs |
| `getRealTimeLogs()` | `callback` | Monitors real-time attendance events |
| `clearAttendanceLog()` | - | Clears all attendance logs |
| `getAttendanceSize()` | - | Gets total number of attendance records |
| `freeData()` | - | Clears transfer buffer |

### Device Information

| Method | Description |
|--------|-------------|
| `getInfo()` | Gets device capacity and counts |
| `getDeviceVersion()` | Gets device firmware version |
| `getDeviceName()` | Gets device name |
| `getPlatform()` | Gets device platform |
| `getOS()` | Gets device operating system |
| `getSerialNumber()` | Gets device serial number |
| `getFirmware()` | Gets firmware information |
| `getPIN()` | Gets PIN configuration |
| `getFaceOn()` | Gets face recognition status |
| `getSSR()` | Gets self-service recorder status |
| `getWorkCode()` | Gets work code configuration |
| `getTime()` | Gets current device time |

### Device Control

| Method | Description |
|--------|-------------|
| `enableDevice()` | Enables device operations |
| `disableDevice()` | Disables device operations |
| `restart()` | Restarts the device |
| `powerOff()` | Powers off the device |
| `setTime()` | Sets device time |

### Time Management

| Method | Parameters | Description |
|--------|------------|-------------|
| `getTime()` | - | Gets current device time |
| `setTime()` | `date?` | Sets device time (defaults to current time) |

### Connection & Status

| Method | Description |
|--------|-------------|
| `isConnected()` | Checks if device is connected |
| `getConnectionType()` | Returns connection type (tcp/udp) |
| `getSocketStatus()` | Gets socket connection status |

### Utility Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `freeData()` | - | Frees device buffer data |
| `executeCmd()` | `command, data` | Executes custom command |
| `setIntervalSchedule()` | `callback, timer` | Sets recurring task |
| `setTimerSchedule()` | `callback, timer` | Sets one-time task |
| `clearIntervalSchedule()` | - | Clears recurring task |
| `clearTimerSchedule()` | - | Clears one-time task |

## 💡 Examples

### Real-time Monitoring

```typescript
import ZKAttendanceClient from 'zk-attendance-sdk';

const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Listen for real-time events
await client.getRealTimeLogs(event => {
  console.log('New attendance:', {
    userId: event.userId,
    timestamp: event.attTime,
  });
});

// Keep monitoring (disconnect manually when done)
```

### User Management

```typescript
import ZKAttendanceClient from 'zk-attendance-sdk';

const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Add a new user
await client.setUser(
  1,
  'EMP001',
  'John Doe',
  '123456',
  0,
  12345,
);

// Delete a user
await client.deleteUser(1);

await client.disconnect();
```

### Device Control

```typescript
import ZKAttendanceClient from 'zk-attendance-sdk';

const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

if (client.isConnected()) {
  console.log('Connection type:', client.getConnectionType());
  await client.setTime(new Date());
  await client.restart();
}

await client.disconnect();
```

### Scheduled Tasks

```typescript
import ZKAttendanceClient from 'zk-attendance-sdk';

const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

client.setIntervalSchedule(async () => {
  const logs = await client.getAttendances();
  console.log('Logs count:', logs.data.length);
}, 30000);

// Clear scheduled task when done
client.clearIntervalSchedule();
```

## 🔧 Configuration

### Constructor Parameters

```javascript
new ZKAttendanceClient(ip, port, timeout, inport)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ip` | string | - | Device IP address (required) |
| `port` | number | `4370` | Device port |
| `timeout` | number | `5000` | Connection timeout in milliseconds |
| `inport` | number | Same as `port` | Local UDP port for receiving real-time events |

> **Busy state handling:** The client serializes device commands. If you start another request while one is still running, it raises a `ZKError` with a `[BUSY]` prefix. Wait for the current call to finish or catch the error and retry.

### Logging

By default, the SDK does not write any logs or files. Pass a 5th
constructor argument to route internal warnings/errors to your own
logger:

```typescript
import ZKAttendanceClient, { fileLogger } from 'zk-attendance-sdk';

const client = new ZKAttendanceClient(
  '192.168.1.106',
  4370,
  5000,
  undefined,
  {
    warn: msg => console.warn(msg),
    error: msg => console.error(msg),
  },
);
```

To restore the pre-2.3.0 behavior of appending errors to a dated local
`.err.log` file, pass the exported `fileLogger` instead of a custom object.

### Connection Types

The SDK automatically attempts TCP connection first, then falls back to UDP if TCP fails. You can check the active connection type:

```javascript
const connectionType = client.getConnectionType(); // 'tcp' or 'udp'
const isConnected = client.isConnected(); // true/false
```

## 🔥 Troubleshooting

### Can't connect to the device / firewall issues

1. **Check device IP & port**
   - The device needs a *local* IP (e.g. `192.168.1.106`) and the default port is **4370**.
   - Test on the same LAN/Wi-Fi first — if your machine and the device share a network, the SDK should connect without extra configuration.

2. **Check router firewall / port blocking**
   - Routers sometimes block the device port (4370). Open it in the router firewall.
   - Give the device a **static IP** so it doesn't change.

3. **Port forwarding (for remote/global access)**
   - On the router, forward `PublicIP:4370 → DeviceLocalIP:4370`.
   - This only works if your network has a real **public IP** — if your ISP only gives a private/CGNAT IP, port forwarding won't work and you'll need a VPN or tunnel instead.

Common causes of connection failures: wrong IP/port, router blocking the port, a dynamic device IP that changed, or an ISP that doesn't provide a public IP.

### Accessing a device behind a client's LAN (SaaS use case)

If the device sits inside a client's office network and your app runs in the cloud, you have three options:

- **Port forwarding + public IP** — simplest, but only works if the client has a real public IP, and exposing the raw device port is insecure.
- **VPN / tunnel (recommended)** — use a tunnel (e.g. Cloudflare Tunnel, ngrok) to expose a small local server that talks to the device via this SDK, and access it through a subdomain like `zk.mydomain.com`. This works even without a public IP and lets you add IP restrictions and authentication (e.g. JWT) in front of the device.
- **Device "push" mode (if supported)** — some ZKTeco models can push attendance data to your server, avoiding inbound connections entirely.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

Found a bug? Please report it [here](https://github.com/jmrashed/zk-attendance-sdk/issues).

## ⭐ Support

If this project helped you, please give it a ⭐ on [GitHub](https://github.com/jmrashed/zk-attendance-sdk)!

---

**Author:** [Md Rasheduzzaman](https://github.com/jmrashed)  
**Email:** jmrashed@gmail.com
