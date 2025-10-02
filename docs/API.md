# API Documentation

## ZKAttendanceClient

### Constructor
```javascript
new ZKAttendanceClient(ip, port, timeout, inport)
```

### Methods

#### `createSocket()`
Creates a connection to the device.

#### `getInfo()`
Returns general information about the device.

#### `getUsers()`
Returns an array of all users in the device.

#### `setUser(uid, userid, name, password, role, cardno)`
Adds a new user to the device.

#### `getAttendances()`
Returns an array of all attendance logs.

#### `getRealTimeLogs(callback)`
Sets up real-time log monitoring.

#### `disconnect()`
Disconnects from the device.

#### Device Information Methods
- `getDeviceVersion()` - Returns device version
- `getDeviceName()` - Returns device name  
- `getPlatform()` - Returns platform version
- `getOS()` - Returns OS version
- `getPIN()` - Returns PIN configuration
- `getFaceOn()` - Returns face recognition status
- `getSSR()` - Returns SSR status

#### Utility Methods
- `getAttendanceSize()` - Returns attendance log size
- `clearAttendanceLog()` - Clears attendance logs
- `enableDevice()` - Enables the device
- `disableDevice()` - Disables the device