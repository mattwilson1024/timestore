import { GetTimestampFunction } from './get-timestamp-function';

type MaxChunkSizeUnit = 'day' | 'week' | 'month';

export interface ITimestoreOptions {
  getTimestampFunction: GetTimestampFunction;
  maxChunkSize?: {
    amount: number;
    unit: MaxChunkSizeUnit
  }
}
