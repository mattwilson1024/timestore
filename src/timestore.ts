import moment from 'moment';
import { Moment } from 'moment';

import { ISO8601Date } from './models/date-types';
import { findLastIndex } from './utils/array-utils';

export enum IChunkStatus {
  Ok,
  Loading,
  Missing,
  Expired
}

export interface IChunk<T = any> {
  from: Moment;
  to: Moment;
  status: IChunkStatus;
  isLoading: boolean;
  expiryTime?: Moment;
  data?: T;
}

export interface ITimestoreBucket {
  name: string;
}

export interface ITimestoreQueryParams {
  from: ISO8601Date,
  to: ISO8601Date
}

export class Timestore<T> {
  private _chunks: IChunk<T>[] = [];

  private insertChunk(chunkToInsert: IChunk): void {
    // Example existing chunks:
    // jun1 - jun30
    // aug1 - aug31
    // dec1 - dec31

    // inserting a chunk "oct1 - oct30" would add it at index 2

    if (!this._chunks.length) { 
      this._chunks.push(chunkToInsert);
    } else {
      const insertPosition = findLastIndex(this._chunks, chunk => chunkToInsert.from.isBefore(chunk.from));
      this._chunks.splice(insertPosition, 0, chunkToInsert);

      // TODO: If there are any chunks before it, shorten them or remove them entirely if this one overlaps
      // TODO: If there are any chunks after it, shorten them or remote them entirely if this one overlaps
    }
  }

  public store<T>(from: ISO8601Date, to: ISO8601Date, data: T, expires?: ISO8601Date|number): void {
    const chunk: IChunk<T> = {
      from: moment(from),
      to: moment(to),
      data,
      isLoading: false,
      status: IChunkStatus.Ok
    };

    if (expires) {
      chunk.expiryTime = (typeof expires === 'number') ? moment().add(expires, 'seconds') : moment(expires);
    }
    this.insertChunk(chunk);
  }

  public query(params: ITimestoreQueryParams): IChunk<T>[] {
    const fromMoment = moment(params.from);
    const toMoment = moment(params.to);


    // If there are no stored chunks, then return the whole requested range as "missing"
    if (!this._chunks.length) {
      // TODO: Divide the range up into smaller chunks rather then assuming it'll be one big one
      return [{
        from: fromMoment,
        to: toMoment,
        data: null,
        status: IChunkStatus.Missing,
        isLoading: false
      } as IChunk<T>];
    }
    else {
      return [];
    }

  }

  
}
