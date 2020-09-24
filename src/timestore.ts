import { DateTime, Duration, Interval } from 'luxon';
import { IChunk, ITimestampedData } from './models/chunk';
import { ISO8601Date } from './models/date-types';
import { GetTimestampFunction } from './models/get-timestamp-function';
import { ISlice, SliceFactory, SliceStatus } from './models/slice';
import { ITimestoreQueryParams } from './models/timestore-query-params';
import { findLastIndex } from './utils/array-utils';
import { fromUtcIso, toUtcIso } from './utils/utc-iso-helpers';

const ONE_MILLISECOND = Duration.fromObject({ milliseconds: 1 });

export class Timestore<T> {
  private _chunks: IChunk<T>[] = [];

  public chunks() { return this._chunks; }

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
      const fitsBeforeIndex = findLastIndex(this._chunks, chunk => fromUtcIso(chunkToInsert.from) < fromUtcIso(chunk.from));
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
      from,
      to,
      data: data.map((dataItem: T) => {
        return {
          t: this.getTimestampFunction(dataItem),
          v: dataItem
        } as ITimestampedData<T>
      }),
      isLoading: false
    };

    if (expires) {
      chunk.expiryTime = (typeof expires === 'number') ? toUtcIso(DateTime.utc().plus(Duration.fromObject({ seconds: expires }))) : expires;
    }
    this.insertChunk(chunk);
  }

  private getChunksWithinInterval(from: ISO8601Date, to: ISO8601Date): IChunk<T>[] {
    const requestedInterval = Interval.fromDateTimes(fromUtcIso(from), fromUtcIso(to));

    return this._chunks.filter(chunk => {
      const chunkInterval = Interval.fromDateTimes(fromUtcIso(chunk.from), fromUtcIso(chunk.to));
      return chunkInterval.overlaps(requestedInterval);
    });
  }

  public query(params: ITimestoreQueryParams): ISlice<T>[] {
    // We only need to consider any chunks that have _any overlap_ with the requested interval
    // e.g. if a stored chunk doesn't overlap at all with the queried interval, then we don't want to include it in the results
    const chunks = this.getChunksWithinInterval(params.from, params.to);

    // If there are no stored chunks, then return the whole requested range as "missing"
    if (!chunks.length) {
      // TODO: Divide the range up into smaller chunks rather then assuming it'll be one big one
      return [
        SliceFactory.createEmptySlice(params.from, params.to)
      ];
    }

    let results: ISlice<T>[] = [];
    const firstChunk = chunks[0];
    const lastChunk = chunks.slice(-1)[0];

    if (fromUtcIso(params.from) < fromUtcIso(firstChunk.from)) {
      results.push(SliceFactory.createEmptySlice(
        params.from,
        toUtcIso(fromUtcIso(firstChunk.from).minus(ONE_MILLISECOND))
      ));
    }

    chunks.forEach((chunk, chunkIndex) => {
      // Create a slice to represent the stored chunk
      const hasExpired = chunk.expiryTime && DateTime.fromSeconds(Date.now() * 1000) >= fromUtcIso(chunk.expiryTime);
      const status = hasExpired ? SliceStatus.Expired : SliceStatus.Filled;
      results.push({
        status: status,
        from: chunk.from, // TODO: Trim the chunk time if the request doesn't need all of it
        to: chunk.to,
        data: chunk.data.map(d => d.v),
        isLoading: chunk.isLoading,
        expiryTime: chunk.expiryTime
      });

      // Add an additional empty slice if there is a gap between this chunk and the next one
      const isLastChunk = chunkIndex === chunks.length - 1;
      if (!isLastChunk) {
        const nextChunk = chunks[chunkIndex + 1];

        const thisChunkTo = fromUtcIso(chunk.to);
        const nextChunkFrom = fromUtcIso(nextChunk.from);
        if (!thisChunkTo.equals(nextChunkFrom)) {
          results.push(SliceFactory.createEmptySlice(
            toUtcIso(thisChunkTo.plus(ONE_MILLISECOND)),
            toUtcIso(nextChunkFrom.minus(ONE_MILLISECOND))
          ));
        }
      }
    });

    if (fromUtcIso(params.to) > fromUtcIso(lastChunk.to)) {
      results.push(SliceFactory.createEmptySlice(
        toUtcIso(fromUtcIso(lastChunk.to).plus(ONE_MILLISECOND)),
        params.to
      ));
    }

    return results;
  }
}
