import type {
  decodeRecordData16,
  decodeRecordData40,
  decodeRecordRealTimeLog18,
  decodeRecordRealTimeLog52,
  decodeUserData28,
  decodeUserData72,
} from './helper/utils';

/** User record shape returned by getUsers() when connected over TCP. */
export type ZKUserTcp = ReturnType<typeof decodeUserData72>;

/** User record shape returned by getUsers() when connected over UDP. */
export type ZKUserUdp = ReturnType<typeof decodeUserData28>;

/** Attendance record shape returned by getAttendances() when connected over TCP. */
export type ZKAttendanceRecordTcp = ReturnType<typeof decodeRecordData40> & {
  ip: string;
};

/** Attendance record shape returned by getAttendances() when connected over UDP. */
export type ZKAttendanceRecordUdp = ReturnType<typeof decodeRecordData16> & {
  ip: string;
};

/** Real-time event shape delivered by getRealTimeLogs() when connected over TCP. */
export type ZKRealTimeLogTcp = ReturnType<typeof decodeRecordRealTimeLog52>;

/** Real-time event shape delivered by getRealTimeLogs() when connected over UDP. */
export type ZKRealTimeLogUdp = ReturnType<typeof decodeRecordRealTimeLog18>;

/** Device capacity/usage counters returned by getInfo(). */
export interface ZKDeviceInfo {
  userCounts: number;
  logCounts: number;
  logCapacity: number;
}
