import { DateTime, Duration, DurationUnit, Interval } from 'luxon';

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

export function sliceIntervalIntoChunks(inputInterval: Interval, amount: number, unit: DurationUnit, useWholeUnits: boolean = false): Interval[] {
  const chunks: Interval[] = [];

  if (inputInterval.end < inputInterval.start) {
    throw new Error('Cannot split interval into chunks - the end time must be after the start time');
  }

  if (inputInterval.start.equals(inputInterval.end)) {
    return [inputInterval];
  }

  let chunkStart: DateTime = inputInterval.start;
  let chunkEnd: DateTime;

  if (useWholeUnits) { chunkStart = chunkStart.startOf(unit); }

  while (chunkStart < inputInterval.end) {
    chunkEnd = chunkStart.plus(createDuration(amount, unit));

    if (chunkStart < inputInterval.start) {
      chunkStart = inputInterval.start;
    }
    if (chunkEnd > inputInterval.end) {
      chunkEnd = inputInterval.end;
    }
    chunks.push(Interval.fromDateTimes(
      chunkStart,
      chunkEnd.minus(Duration.fromObject({ milliseconds: 1 }))
    ));
    chunkStart = chunkEnd;
  }

  return chunks;
}
