import { DateTime, Interval } from 'luxon';
import { sliceIntervalIntoChunks } from './slice-interval-into-chunks';

function debugConsoleLogChunks(chunks: Interval[]) {
  const chunkStrings = chunks.map(chunk => {
    const from = `${chunk.start.toUTC().toISO()} (${chunk.start.toLocaleString(DateTime.DATETIME_FULL)})`;
    const to = `${chunk.end.toUTC().toISO()} (${chunk.end.toLocaleString(DateTime.DATETIME_FULL)})`;
    return `${from} -> ${to}`;
  });
  console.log(chunkStrings.join(`\n`));
}

function assertChunksMatch(chunks: Interval[], expectedChunks: Interval[]) {
  expect(chunks).toBeDefined();
  expect(chunks).toHaveLength(expectedChunks.length);
  expectedChunks.forEach((chunk, index) => {
    expect(chunks[index].equals(expectedChunks[index])).toBe(true);
  });
}

describe('sliceIntervalIntoChunks', () => {

  it('should correctly split a 25 day period (1st Feb - 25th Feb) into chunks of 10 days', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 1),
      DateTime.local(2019, 2, 25),
    );
    const chunks = sliceIntervalIntoChunks(interval, 10, 'days');

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 1), DateTime.local(2019, 2, 10).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,2, 11), DateTime.local(2019, 2, 20).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,2, 21), DateTime.local(2019, 2, 24).endOf('day'))
    ]);
  });

  it('should return one chunk if the chunk duration is longer than the provided range', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 1),
      DateTime.local(2019, 2, 25),
    );
    const chunks = sliceIntervalIntoChunks(interval, 30, 'days');

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 1), DateTime.local(2019, 2, 24).endOf('day'))
    ]);
  });

  it('should correctly split a 6 month period (12th Feb - 12th July) into 1 month chunks', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 12),
      DateTime.local(2019, 7, 12),
    );
    const chunks = sliceIntervalIntoChunks(interval, 1, 'months');

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 12), DateTime.local(2019, 3, 11).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,3, 12), DateTime.local(2019, 4, 11).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,4, 12), DateTime.local(2019, 5, 11).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,5, 12), DateTime.local(2019, 6, 11).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,6, 12), DateTime.local(2019, 7, 11).endOf('day'))
    ]);
  });

  it('should correctly split a 6 month period (12th Feb - 12th July) into chunks of separate calendar months', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 12),
      DateTime.local(2019, 7, 12),
    );
    const chunks = sliceIntervalIntoChunks(interval, 1, 'months', true);

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 12), DateTime.local(2019, 2, 28).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,3, 1), DateTime.local(2019, 3, 31).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,4, 1), DateTime.local(2019, 4, 30).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,5, 1), DateTime.local(2019, 5, 31).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,6, 1), DateTime.local(2019, 6, 30).endOf('day')),
      Interval.fromDateTimes(DateTime.local(2019,7, 1), DateTime.local(2019, 7, 11).endOf('day'))
    ]);
  });

  it('should correct split a 1 month period (1st June - 1st July) into a 1 month chunk', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 6, 1),
      DateTime.local(2019, 7, 1),
    );
    const chunks = sliceIntervalIntoChunks(interval, 1, 'months');

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,6, 1), DateTime.local(2019, 6, 30).endOf('day'))
    ]);
  });

  it('should throw if end date is before start date', () => {
    expect(() => {
      const interval = Interval.fromDateTimes(
        DateTime.local(2019, 2, 1),
        DateTime.local(2019, 1, 1),
      );
      const chunks = sliceIntervalIntoChunks(interval, 1, 'months');
    }).toThrow();
  });

  it('should return a single chunk if the start & end dates are the same', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 1),
      DateTime.local(2019, 2, 1),
    );
    const chunks = sliceIntervalIntoChunks(interval, 1, 'months');

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 1), DateTime.local(2019, 2, 1))
    ]);
  });

});
