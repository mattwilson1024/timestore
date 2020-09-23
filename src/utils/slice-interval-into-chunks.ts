import { ISO8601Date } from '../models/date-types';
import { DateTime, Duration, DurationUnit, Interval } from 'luxon';

export interface SlicedInterval {
  start: ISO8601Date;
  end: ISO8601Date;
}

function createDuration(amount: number, unit: DurationUnit): Duration {
  switch (unit) {
    case 'day':
    case 'days':
      return Duration.fromObject({ days: amount });
    case 'week':
    case 'weeks':
      return Duration.fromObject({ weeks: amount });
    case 'month':
    case 'months':
      return Duration.fromObject({ months: amount });
    default:
      throw new Error(`Unsupported duration units: ${unit}`);
  }
}

export function sliceIntervalIntoChunks(start: ISO8601Date, end: ISO8601Date, amount: number, unit: DurationUnit, useWholeUnits: boolean = false): SlicedInterval[] {
  const chunks: SlicedInterval[] = [];

  const overall = Interval.fromDateTimes(DateTime.fromISO(start, { zone: 'utc' }), DateTime.fromISO(end,{ zone: 'utc' }));
  // const overall = Interval.fromDateTimes(start, end);

  console.log('startoffset', overall.start.offset);
  console.log('endoffset', overall.end.offset);
  console.log('endzone', overall.end.zoneName);

  DateTime.fromISO('', { zone: 'utc' })

  if (overall.end < overall.start) {
    throw new Error('Cannot split interval into chunks - the end time must be after the start time');
  }

  if (overall.start.equals(overall.end)) {
    return [{ start: overall.start.toISO(), end: overall.end.toISO() }];
  }

  let chunkStart: DateTime = overall.start;
  let chunkEnd: DateTime;

  if (useWholeUnits) { chunkStart = chunkStart.startOf(unit); }

  while (chunkStart < overall.end) {
    chunkEnd = chunkStart.plus(createDuration(amount, unit));

    if (chunkStart < overall.start) {
      chunkStart = overall.start;
    }
    if (chunkEnd > overall.end) {
      chunkEnd = overall.end;
    }
    chunks.push({
      start: chunkStart.toISO(),
      end: chunkEnd.minus(Duration.fromObject({ milliseconds: 1 })).toISO()
    });
    chunkStart = chunkEnd;
  }

  return chunks;
}
