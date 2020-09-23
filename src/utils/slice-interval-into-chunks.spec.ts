import { sliceIntervalIntoChunks } from './slice-interval-into-chunks';
import { DateTime, Duration, Interval } from 'luxon';

const ONE_MILLISECOND = Duration.fromObject({ milliseconds: 1 });

// function assertChunksMatch(chunks: SlicedInterval[], expectedChunks: SlicedInterval[]) {
//   expect(chunks).toBeDefined();
//   expect(chunks).toHaveLength(expectedChunks.length);
//   expectedChunks.forEach((chunk, index) => {
//     // const expectedChunk = expectedChunks[index];
//     // expect(isEqual(parseISO(chunk.start), parseISO(expectedChunk.start))).toBe(true);
//     // expect(isEqual(parseISO(chunk.end), parseISO(expectedChunk.end))).toBe(true);;
//     // // expect(isEqual(parseISO(chunks[index]), parseISO(expectedChunks[index])).toBe(true);
//     // expect(chunks[index]).toEqual(expectedChunks[index]);
//
//     const expectedChunk = expectedChunks[index];
//     const chunkInterval = Interval.fromDateTimes(DateTime.fromISO(chunk.start), DateTime.fromISO(chunk.end));
//     const expectedChunkInterval = Interval.fromDateTimes(DateTime.fromISO(expectedChunk.start), DateTime.fromISO(expectedChunk.end));
//
//     expect(chunkInterval.equals(expectedChunkInterval)).toBe(true);
//   });
// }


function assertChunksMatch(chunks: Interval[], expectedChunks: Interval[]) {
  expect(chunks).toBeDefined();
  expect(chunks).toHaveLength(expectedChunks.length);
  expectedChunks.forEach((chunk, index) => {
    expect(chunks[index].equals(expectedChunks[index])).toBe(true);

    // const expectedChunk = expectedChunks[index];
    // expect(isEqual(parseISO(chunk.start), parseISO(expectedChunk.start))).toBe(true);
    // expect(isEqual(parseISO(chunk.end), parseISO(expectedChunk.end))).toBe(true);;
    // // expect(isEqual(parseISO(chunks[index]), parseISO(expectedChunks[index])).toBe(true);
    // expect(chunks[index]).toEqual(expectedChunks[index]);

    // const expectedChunk = expectedChunks[index];
    // const chunkInterval = Interval.fromDateTimes(DateTime.fromISO(chunk.start), DateTime.fromISO(chunk.end));
    // const expectedChunkInterval = Interval.fromDateTimes(DateTime.fromISO(expectedChunk.start), DateTime.fromISO(expectedChunk.end));
    //
    // expect(chunkInterval.equals(expectedChunkInterval)).toBe(true);
  });
}

describe('sliceIntervalIntoChunks', () => {

  // it('should correctly split a 25 day period (1st Feb - 25th Feb) into chunks of 10 days', () => {
  //   const chunks = sliceIntervalIntoChunks('2019-02-01T00:00:00Z', '2019-02-25T00:00:00Z', 10, 'days');
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-02-01T00:00:00.000Z', end: '2019-02-10T23:59:59.999Z' },
  //     { start: '2019-02-11T00:00:00.000Z', end: '2019-02-20T23:59:59.999Z' },
  //     { start: '2019-02-21T00:00:00.000Z', end: '2019-02-24T23:59:59.999Z' }
  //   ]);
  // });
  //
  // it('should correctly split a 25 day period (1st Feb - 25th Feb) into chunks of 10 days', () => {
  //   const chunks = sliceIntervalIntoChunks('2019-02-01T00:00:00Z', '2019-02-25T00:00:00Z', 10, 'days');
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-02-01T00:00:00.000Z', end: '2019-02-10T23:59:59.999Z' },
  //     { start: '2019-02-11T00:00:00.000Z', end: '2019-02-20T23:59:59.999Z' },
  //     { start: '2019-02-21T00:00:00.000Z', end: '2019-02-24T23:59:59.999Z' }
  //   ]);
  // });
  //
  // it('should return one chunk if the chunk duration is longer than the provided range', () => {
  //   const chunks = sliceIntervalIntoChunks('2019-02-01T00:00:00Z', '2019-02-25T00:00:00Z', 30, 'days');
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-02-01T00:00:00.000Z', end: '2019-02-24T23:59:59.999Z' }
  //   ]);
  // });

  it('should correctly split a 6 month period (12th Feb - 12th July) into 1 month chunks', () => {
    const interval = Interval.fromDateTimes(
      DateTime.local(2019, 2, 12),
      DateTime.local(2019, 7, 12),
    );

    const chunks = sliceIntervalIntoChunks(interval, 1, 'months');

    const chunkStrings = chunks.map(chunk => `${chunk.start.toUTC().toISO()} -> ${chunk.end.toUTC().toISO()} (${chunk.end.toLocaleString(DateTime.DATETIME_FULL)})`);
    console.log(chunkStrings.join(`\n`));

    assertChunksMatch(chunks, [
      Interval.fromDateTimes(DateTime.local(2019,2, 12), DateTime.local(2019, 3, 12).minus(ONE_MILLISECOND)),
      Interval.fromDateTimes(DateTime.local(2019,3, 12), DateTime.local(2019, 4, 12).minus(ONE_MILLISECOND)),
      Interval.fromDateTimes(DateTime.local(2019,4, 12), DateTime.local(2019, 5, 12).minus(ONE_MILLISECOND)),
      Interval.fromDateTimes(DateTime.local(2019,5, 12), DateTime.local(2019, 6, 12).minus(ONE_MILLISECOND)),
      Interval.fromDateTimes(DateTime.local(2019,6, 12), DateTime.local(2019, 7, 12).minus(ONE_MILLISECOND))
    ]);
  });

  // test('should correctly split a 6 month period (12th Feb - 12th July) into chunks of separate calendar months', () => {
  //   const chunks = sliceIntervalIntoChunks('2019-02-12T00:00:00Z', '2019-07-12T00:00:00Z', 1, SliceUnit.Months, true);
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-02-12T00:00:00.000Z', end: '2019-02-28T23:59:59.999Z' }, // first calendar month with start clipped to requested range
  //     { start: '2019-03-01T00:00:00.000Z', end: '2019-03-31T23:59:59.999Z' }, // full calendar month
  //     { start: '2019-04-01T00:00:00.000Z', end: '2019-04-30T23:59:59.999Z' }, // full calendar month
  //     { start: '2019-05-01T00:00:00.000Z', end: '2019-05-31T23:59:59.999Z' }, // full calendar month
  //     { start: '2019-06-01T00:00:00.000Z', end: '2019-06-30T23:59:59.999Z' }, // full calendar month
  //     { start: '2019-07-01T00:00:00.000Z', end: '2019-07-11T23:59:59.999Z' }  // final calendar month with end clipped to requested range
  //   ]);
  // });
  //
  // test('should correct split a 1 month period (1st June - 1st July) into 1 month chunks', () => {
  //   const chunks = sliceDateRangeIntoChunks('2019-06-01T00:00:00Z', '2019-07-01T00:00:00Z', 1, 'month');
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-06-01T00:00:00.000Z', end: '2019-06-30T23:59:59.999Z' }
  //   ]);
  // });
  //
  // test('should throw if end date is before start date', () => {
  //   expect(() => {
  //     sliceDateRangeIntoChunks('2019-02-01T00:00:00Z', '2019-01-01T00:00:00Z', 1, 'month');
  //   }).toThrow();
  // });
  //
  // test('should return a single chunk if the start & end dates are the same', () => {
  //   const chunks = sliceDateRangeIntoChunks('2019-01-01T00:00:00Z', '2019-01-01T00:00:00Z', 1, 'month');
  //
  //   assertChunksMatch(chunks, [
  //     { start: '2019-01-01T00:00:00.000Z', end: '2019-01-01T00:00:00.000Z' }
  //   ]);
  // });

});
