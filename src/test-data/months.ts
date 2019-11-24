import moment = require('moment');

export const JAN = 0;
export const FEB = 1;
export const MAR = 2;
export const APR = 3;
export const MAY = 4;
export const JUN = 5;
export const JUL = 6;
export const AUG = 7;
export const SEP = 8;
export const OCT = 9;
export const NOV = 10;
export const DEC = 11;

export function startOf(monthZeroIndexed: number): string {
  return moment({ date: 1, month: monthZeroIndexed, year: 2019 }).toISOString();
}

export function endOf(monthZeroIndexed: number): string {
  return moment({ date: 1, month: monthZeroIndexed, year: 2019 }).endOf('month').toISOString();
}

export function fifthOf(monthZeroIndexed: number): string {
  return moment({ date: 5, month: monthZeroIndexed, year: 2019 }).toISOString();
}

export function tenthOf(monthZeroIndexed: number): string {
  return moment({ date: 10, month: monthZeroIndexed, year: 2019 }).toISOString();
}