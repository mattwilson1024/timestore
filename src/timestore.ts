import moment from 'moment';

import { ISO8601Date, IDateRange } from './models/date-types';
import { findLastIndex } from './utils/array-utils';
import { ITimestoreQueryParams } from './models/timestore-query-params';
import { doRangesIntersect } from './utils/date-range-intersection';
import { IChunk, ITimestampedData } from './models/chunk';
import { IBucket, BucketFactory, BucketStatus } from './models/bucket';

export type GetTimestampFunction<T = any> = (dataItem: T) => ISO8601Date;

export class Timestore<T> {
  private _chunks: IChunk<T>[] = [];

  constructor(private getTimestampFunction: GetTimestampFunction) {
  }

  private insertChunk(chunkToInsert: IChunk<T>): void {
    // Example existing chunks:
    // jun1 - jun30
    // aug1 - aug31
    // dec1 - dec31
    // inserting a chunk "oct1 - oct30" would add it at index 2

    if (!this._chunks.length) { 
      this._chunks.push(chunkToInsert);
    } else {
      const fitsBeforeIndex = findLastIndex(this._chunks, chunk => chunkToInsert.from.isBefore(chunk.from));
      const belongsAtEnd = fitsBeforeIndex === -1;
      
      if (belongsAtEnd) {
        this._chunks.push(chunkToInsert);
      } else {
        this._chunks.splice(fitsBeforeIndex, 0, chunkToInsert);
      }

      // TODO: If there are any chunks before it, shorten them or remove them entirely if this one overlaps
      // TODO: If there are any chunks after it, shorten them or remote them entirely if this one overlaps
    }
  }

  public store(from: ISO8601Date, to: ISO8601Date, data: T[], expires?: ISO8601Date|number): void {
    const chunk: IChunk<T> = {
      from: moment(from),
      to: moment(to),
      data: data.map((dataItem: T) => {
        return {
          t: moment(this.getTimestampFunction(dataItem)),
          v: dataItem
        } as ITimestampedData<T>
      }),
      isLoading: false
    };

    if (expires) {
      chunk.expiryTime = (typeof expires === 'number') ? moment().add(expires, 'seconds') : moment(expires);
    }
    this.insertChunk(chunk);
  }

  private getChunksWithinPeriod(from: ISO8601Date, to: ISO8601Date): IChunk<T>[] {
    const requestedRange: IDateRange = { start: from, end: to };
    return this._chunks.filter(chunk => doRangesIntersect(
      { start: chunk.from.toISOString(), end: chunk.to.toISOString() },
      requestedRange
    ));
  }

  public query(params: ITimestoreQueryParams): IBucket<T>[] {
    const fromMoment = moment(params.from);
    const toMoment = moment(params.to);

    // We only need to considering any chunks that have _any overlap_ with the requested range
    // e.g. if a stored chunk doesn't overlap at all with the queried range, then we don't want to include it in the results
    const chunks = this.getChunksWithinPeriod(params.from, params.to);

    // If there are no stored chunks, then return the whole requested range as "missing"
    if (!chunks.length) {
      // TODO: Divide the range up into smaller chunks rather then assuming it'll be one big one
      return [
        BucketFactory.createEmptyBucket(params.from, params.to)
      ];
    }

    let results: IBucket<T>[] = [];
    const firstChunk = chunks[0];
    const lastChunk = chunks.slice(-1)[0];

    if (fromMoment.isBefore(firstChunk.from)) {
      results.push(BucketFactory.createEmptyBucket(params.from, firstChunk.from.clone().subtract(1, 'millisecond').toISOString())
      );
    }

    chunks.forEach((chunk, chunkIndex) => {
      // Add a bucket for the chunk
      const status = !chunk.expiryTime || moment().isBefore(chunk.expiryTime) ? BucketStatus.Filled : BucketStatus.Expired;
      results.push({
        status: status,
        from: chunk.from.toISOString(), // TODO: Trim the chunk time if the request doesn't need all of it
        to: chunk.to.toISOString(),
        data: chunk.data.map(d => d.v),
        isLoading: chunk.isLoading,
        expiryTime: chunk.expiryTime.toISOString()
      });

      // Add an additional empty bucket if there is a gap between this chunk and the next one
      const isLastChunk = chunkIndex === chunks.length - 1;
      if (!isLastChunk) {
        const nextChunk = chunks[chunkIndex + 1];
        if (!chunk.to.isSame(nextChunk.from)) {
          results.push(BucketFactory.createEmptyBucket(chunk.to.clone().add(1, 'millisecond').toISOString(), nextChunk.from.clone().subtract(1, 'millisecond').toISOString()));
        }
      }
      
    });

    if (toMoment.isAfter(lastChunk.to)) {
      results.push(BucketFactory.createEmptyBucket(lastChunk.to.clone().add(1, 'millisecond').toISOString(), params.to))
    }

    return results;
  }
}
