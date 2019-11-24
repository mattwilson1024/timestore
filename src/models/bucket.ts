import { ISO8601Date } from './date-types';
import { IChunk } from './chunk';

export enum IBucketStatus {
  Empty,
  Filled,
  Loading,
  Expired
}

export interface IBucket<T> {
  from: ISO8601Date;
  to: ISO8601Date;
  status: IBucketStatus;
  isLoading: boolean;
  expiryTime?: ISO8601Date;
  data?: T[];
}

export class BucketFactory {
  public static createEmptyBucket<T>(from: ISO8601Date, to: ISO8601Date): IBucket<T> {
    return {
      status: IBucketStatus.Empty,
      from,
      to,
      isLoading: false
    };
  }

  public static createFilledBucketFromChunk<T>(chunk: IChunk<T>) {
    return {
      status: IBucketStatus.Filled,
      from: chunk.from.toISOString(),
      to: chunk.to.toISOString(),
      data: chunk.data.map(d => d.v),
      isLoading: false,
      expiryTime: chunk.expiryTime.toISOString()
    };
  }
}