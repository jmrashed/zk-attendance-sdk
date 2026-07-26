import ZKAttendanceClient, {
  ZKAttendanceRecordTcp,
  ZKDeviceInfo,
  ZKUserTcp,
} from '../src/index';

describe('exported types', () => {
  test('ZKUserTcp shape matches getUsers() TCP result', () => {
    const sample: ZKUserTcp = {
      uid: 1,
      role: 0,
      password: '1234',
      name: 'Jane',
      cardno: 0,
      userId: 'EMP001',
    };
    expect(sample.userId).toBe('EMP001');
  });

  test('ZKAttendanceRecordTcp shape includes ip', () => {
    const sample: ZKAttendanceRecordTcp = {
      userSn: 1,
      deviceUserId: 'EMP001',
      recordTime: new Date().toString(),
      ip: '192.168.1.106',
    };
    expect(sample.ip).toBe('192.168.1.106');
  });

  test('ZKDeviceInfo shape matches getInfo() result', () => {
    const sample: ZKDeviceInfo = {
      userCounts: 1,
      logCounts: 2,
      logCapacity: 3,
    };
    expect(sample.logCapacity).toBe(3);
  });

  test('ZKAttendanceClient remains the default export', () => {
    expect(typeof ZKAttendanceClient).toBe('function');
  });
});
