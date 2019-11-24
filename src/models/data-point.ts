import { ISO8601Date } from './date-types';

export interface IDataPoint {
  t: ISO8601Date;
  v: number;
}