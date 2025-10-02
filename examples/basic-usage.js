const ZKAttendanceClient = require("zk-attendance-sdk");

const runExample = async () => {
  const client = new ZKAttendanceClient("192.168.1.106", 4370, 5200, 5000);
  
  try {
    // Connect to device
    await client.createSocket();
    console.log("Connected to device");

    // Get device info
    const info = await client.getInfo();
    console.log("Device Info:", info);

    // Get all users
    const users = await client.getUsers();
    console.log("Users:", users.data.length);

    // Get attendance logs
    const logs = await client.getAttendances();
    console.log("Attendance logs:", logs.data.length);

    // Disconnect
    await client.disconnect();
    console.log("Disconnected");
  } catch (error) {
    console.error("Error:", error);
  }
};

runExample();