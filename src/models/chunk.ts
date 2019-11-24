import { Moment } from 'moment';

export interface IChunk<T> {
  from: Moment;
  to: Moment;
  isLoading: boolean;
  expiryTime?: Moment;
  data: ITimestampedData<T>[];
}

export interface ITimestampedData<T> { 
  t: Moment;
  v: T
}