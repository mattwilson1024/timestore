import { endOfMonth, formatISO } from 'date-fns';

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
  return formatISO(new Date(2020, monthZeroIndexed, 1));
}

export function endOf(monthZeroIndexed: number): string {
  const startOfMonth = new Date(2020, monthZeroIndexed, 1);
  return formatISO(endOfMonth(startOfMonth));
}

export function fifthOf(monthZeroIndexed: number): string {
  return formatISO(new Date(2020, monthZeroIndexed, 5));
}

export function tenthOf(monthZeroIndexed: number): string {
  return formatISO(new Date(2020, monthZeroIndexed, 10));
}
