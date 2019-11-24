import { Moment } from 'moment';
import { ISO8601Date } from './date-types';

export enum IChunkStatus {
  Ok,
  Loading,
  Missing,
  Expired
}

export interface IChunk<T = any> {
  from: ISO8601Date;
  to: ISO8601Date;
  status: IChunkStatus;
  isLoading: boolean;
  expiryTime?: ISO8601Date;
  data?: T;
}

export interface IChunkInternal<T = any> {
  from: Moment;
  to: Moment;
  status: IChunkStatus;
  isLoading: boolean;
  expiryTime?: Moment;
  data?: T;
}