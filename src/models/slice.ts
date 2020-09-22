import { ISO8601Date } from './date-types';
import { IChunk } from './chunk';

export enum SliceStatus {
  Empty = 'Empty',
  Filled = 'Filled',
  Loading = 'Loading',
  Expired = 'Expired'
}

export interface ISlice<T> {
  from: ISO8601Date;
  to: ISO8601Date;
  status: SliceStatus;
  isLoading: boolean;
  expiryTime?: ISO8601Date;
  data?: T[];
}

export class SliceFactory {
  public static createEmptySlice<T>(from: ISO8601Date, to: ISO8601Date): ISlice<T> {
    return {
      status: SliceStatus.Empty,
      from,
      to,
      isLoading: false
    };
  }

  public static createFilledSliceFromChunk<T>(chunk: IChunk<T>) {
    return {
      status: SliceStatus.Filled,
      from: chunk.from,
      to: chunk.to,
      data: chunk.data.map(d => d.v),
      isLoading: false,
      expiryTime: chunk.expiryTime
    };
  }
}
