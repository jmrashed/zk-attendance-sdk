# API Documentation

## ZKAttendanceClient

### Constructor
```javascript
new ZKAttendanceClient(ip, port, timeout, inport)
```

### Methods

#### `createSocket()`
Creates a connection to the device.

#### `getConnectionType()`
Returns the current connection type.

#### `isConnected()`
Checks if a socket is connected.

#### `getInfo()`
Returns general information about the device.

#### `getUsers()`
Returns an array of all users in the device.

#### `setUser(uid, userid, name, password, role, cardno)`
Adds a new user to the device.

#### `deleteUser(uid)`
Removes a user by ID.

#### `getAttendances()`
Returns an array of all attendance logs.

#### `getRealTimeLogs(callback)`
Sets up real-time log monitoring.

#### `freeData()`
Clears the device transfer buffer.

#### `disconnect()`
Disconnects from the device.

#### Device Information Methods
- `getDeviceVersion()` - Returns device version
- `getDeviceName()` - Returns device name  
- `getPlatform()` - Returns platform version
- `getOS()` - Returns OS version
- `getSerialNumber()` - Returns the serial number
- `getWorkCode()` - Returns work code configuration
- `getPIN()` - Returns PIN configuration
- `getFaceOn()` - Returns face recognition status
- `getSSR()` - Returns SSR status
- `getFirmware()` - Returns firmware info
- `getTime()` - Returns device time

#### Utility Methods
- `getAttendanceSize()` - Returns attendance log count
- `clearAttendanceLog()` - Clears attendance logs
- `enableDevice()` - Enables the device
- `disableDevice()` - Disables the device
- `setTime(date?)` - Updates device time
- `setIntervalSchedule(callback, interval)` - Starts an interval timer
- `setTimerSchedule(callback, timeout)` - Starts a one-shot timer
- `clearIntervalSchedule()` / `clearTimerSchedule()` - Clears timers
- `getSocketStatus()` - Returns socket status
- `executeCmd(command, data?)` - Sends a raw command
- `restart()` - Restarts the device
- `powerOff()` - Powers down the device