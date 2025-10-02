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

## 🚀 Quick Start

```javascript
const ZKAttendanceClient = require('zk-attendance-sdk');

const client = new ZKAttendanceClient('192.168.1.106', 4370, 5200, 5000);

async function main() {
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

### Device Control

| Method | Description |
|--------|-------------|
| `enableDevice()` | Enables device operations |
| `disableDevice()` | Disables device operations |
| `restart()` | Restarts the device |
| `powerOff()` | Powers off the device |

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

```javascript
const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Listen for real-time events
await client.getRealTimeLogs((data) => {
  console.log('New attendance:', {
    userId: data.userId,
    timestamp: data.attTime
  });
});

// Keep monitoring (disconnect manually when done)
```

### User Management

```javascript
const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Add a new user
await client.setUser(
  1,           // uid
  'EMP001',     // userid  
  'John Doe',   // name
  '123456',     // password
  0,            // role (0=user, 1=admin)
  12345         // card number
);

// Delete a user
await client.deleteUser(1);

await client.disconnect();
```

### Device Control

```javascript
const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Check connection status
if (client.isConnected()) {
  console.log('Connection type:', client.getConnectionType());
  
  // Set device time
  await client.setTime(new Date());
  
  // Restart device
  await client.restart();
}

await client.disconnect();
```

### Scheduled Tasks

```javascript
const client = new ZKAttendanceClient('192.168.1.106', 4370);

await client.createSocket();

// Set recurring task
client.setIntervalSchedule(async () => {
  const logs = await client.getAttendances();
  console.log('Logs count:', logs.data.length);
}, 30000); // Every 30 seconds

// Clear scheduled task when done
client.clearIntervalSchedule();
```

## 🔧 Configuration

### Constructor Parameters

```javascript
new ZKAttendanceClient(ip, port, timeout, inport)
```

- `ip` (string): Device IP address
- `port` (number): Device port (default: 4370)
- `timeout` (number): Connection timeout in ms (default: 5000)
- `inport` (number): Local UDP port for real-time events

### Connection Types

The SDK automatically attempts TCP connection first, then falls back to UDP if TCP fails. You can check the active connection type:

```javascript
const connectionType = client.getConnectionType(); // 'tcp' or 'udp'
const isConnected = client.isConnected(); // true/false
```

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
**Email:** jmrashed@example.com
