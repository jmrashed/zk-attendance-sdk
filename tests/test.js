/*  
    Author: Md Rasheduzzaman
    Email:  jmrashed@example.com
    Date: 2023-02-09
*/
const ZKAttendanceClient = require('../index')
const test = async () => {


    let zkInstance = new ZKAttendanceClient('10.20.0.6', 4370, 10000, 4000);
    try {
        // Create socket to machine 
        await zkInstance.createSocket()

        // Get general info like logCapacity, user counts, logs count
        // It's really useful to check the status of device 
        console.log('Device Info:', await zkInstance.getInfo())

        // Get attendances
        const attendences = await zkInstance.getAttendances();
        console.log('Attendances:', attendences.data);

        // Get users
        const users = await zkInstance.getUsers();
        console.log('Users:', users.data)
    } catch (e) {
        console.error('Test failed with error:', e);
    }

}

test()