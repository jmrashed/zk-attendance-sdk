/*  
    Author: Md Rasheduzzaman
    Email:  jmrashed@example.com
    Date: 2023-02-09
*/
import * as fs from 'node:fs/promises';

const parseCurrentTime = () => {
  const currentTime = new Date();
  return {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth() + 1,
    day: currentTime.getDate(),
    hour: currentTime.getHours(),
    second: currentTime.getSeconds(),
  };
};

/** Logs an error message to a file. */
export const log = (text: string): void => {
  const currentTime = parseCurrentTime();
  fs.appendFile(
    `${currentTime.day}`.padStart(2, '0') +
      `${currentTime.month}`.padStart(2, '0') +
      `${currentTime.year}.err.log`,
    `\n [${currentTime.hour}:${currentTime.second}] ${text}`,
  ).catch(() => {});
};
