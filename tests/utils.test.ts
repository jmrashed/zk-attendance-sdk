import { decodeRecordRealTimeLog18 } from '../src/helper/utils';

describe('decodeRecordRealTimeLog18', () => {
  test('decodes a 4-byte little-endian userId, not just its low byte', () => {
    const buffer = Buffer.alloc(18);
    buffer.writeUInt32LE(300, 8); // userId spans bytes 8-11; 300 > 255 so a 1-byte read would truncate it
    buffer.writeUInt8(25, 12); // year -> 2025
    buffer.writeUInt8(6, 13); // month (1-indexed)
    buffer.writeUInt8(15, 14); // date
    buffer.writeUInt8(10, 15); // hour
    buffer.writeUInt8(30, 16); // minute
    buffer.writeUInt8(0, 17); // second

    const result = decodeRecordRealTimeLog18(buffer);

    expect(result.userId).toBe(300);
    expect(result.attTime).toEqual(new Date(2025, 5, 15, 10, 30, 0));
  });
});
