import { ISO8601Date } from './date-types';

export interface IChunk<T> {
  from: ISO8601Date;
  to: ISO8601Date;
  isLoading: boolean;
  expiryTime?: ISO8601Date;
  data?: ITimestampedData<T>[];
}

export interface ITimestampedData<T> {
  t: ISO8601Date;
  v: T
}
