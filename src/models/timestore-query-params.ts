import { ISO8601Date } from './date-types';

export interface ITimestoreQueryParams {
  from: ISO8601Date,
  to: ISO8601Date
}