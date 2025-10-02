const ZKAttendanceClient = require("zk-attendance-sdk");

const runRealtimeExample = async () => {
  const client = new ZKAttendanceClient("192.168.1.106", 4370, 5200, 5000);
  
  try {
    await client.createSocket();
    console.log("Connected for real-time monitoring");

    // Listen for real-time logs
    await client.getRealTimeLogs((data) => {
      console.log("Real-time log:", data);
    });

    console.log("Listening for real-time logs... Press Ctrl+C to stop");
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log("\nDisconnecting...");
      await client.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error("Error:", error);
  }
};

runRealtimeExample();