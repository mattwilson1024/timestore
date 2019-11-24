import moment from 'moment';

import { ISO8601Date } from './models/date-types';
import { findLastIndex } from './utils/array-utils';
import { IChunkInternal, IChunkStatus, IChunk, ChunkFactory } from './models/chunk';
import { ITimestoreQueryParams } from './models/timestore-query-params';

export class Timestore<T> {
  private _chunks: IChunkInternal<T>[] = [];

  private insertChunk(chunkToInsert: IChunkInternal): void {
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
    const chunk: IChunkInternal<T> = {
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
      return [
        ChunkFactory.createMissingChunk(params.from, params.to)
      ];
    }
    
    let results: IChunk<T>[] = [];
    const firstChunk = this._chunks[0];
    const lastChunk = this._chunks.slice(-1)[0];

    if (fromMoment.isBefore(firstChunk.from)) {
      results.push(ChunkFactory.createMissingChunk(params.from, firstChunk.from.toISOString()))
    }

    this._chunks.forEach((chunk, chunkIndex) => {
      results.push(ChunkFactory.createChunkFromInternalChunk(chunk));
      // TODO: Add additional "missing" chunks if there is a gap between this chunk and the next chunk
    });

    if (toMoment.isAfter(lastChunk.to)) {
      results.push(ChunkFactory.createMissingChunk(lastChunk.to.toISOString(), params.to))
    }

    return results;
  }

}
