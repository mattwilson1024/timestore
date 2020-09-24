import { DateTime } from 'luxon';
import { ISO8601Date } from '../models/date-types';
import { toUtcIso } from '../utils/utc-iso-helpers';

export const JAN = 1;
export const FEB = 2;
export const MAR = 3;
export const APR = 4;
export const MAY = 5;
export const JUN = 6;
export const JUL = 7;
export const AUG = 8;
export const SEP = 9;
export const OCT = 10;
export const NOV = 11;
export const DEC = 12;

export function startOf(monthOneIndexed: number): ISO8601Date {
  return toUtcIso(DateTime.local(2020, monthOneIndexed, 1));
}

export function endOf(monthOneIndexed: number): ISO8601Date {
  return toUtcIso(DateTime.local(2020, monthOneIndexed, 1).endOf('month'));
}

export function fifthOf(monthOneIndexed: number): ISO8601Date {
  return toUtcIso(DateTime.local(2020, monthOneIndexed, 5));
}

export function tenthOf(monthOneIndexed: number): ISO8601Date {
  return toUtcIso(DateTime.local(2020, monthOneIndexed, 10));
}
