import { Timestore } from './timestore';
import { IChunkStatus } from './models/chunk';
import { generateTestData } from './test-data/test-data';
import { startOf, endOf, OCT, NOV, DEC } from './test-data/months';

test('starts empty', () => {
  const timestore = new Timestore();

  const chunks = timestore.query({
    from: startOf(NOV),
    to: endOf(NOV)
  });

  expect(chunks.length).toEqual(1);
  expect(chunks[0].status).toEqual(IChunkStatus.Missing);
  expect(chunks[0].from).toEqual(startOf(NOV));
  expect(chunks[0].to).toEqual(endOf(NOV));
  expect(chunks[0].isLoading).toEqual(false);
  expect(chunks[0].data).toBeUndefined();
});

test('Allows storing data', () => {
  const timestore = new Timestore();

  const novData = generateTestData(startOf(NOV), endOf(NOV));

  timestore.store(startOf(NOV), endOf(NOV), novData, 60);
  
  const chunks = timestore.query({
    from: startOf(OCT),
    to: endOf(DEC)
  });

  expect(chunks.length).toEqual(3);
  expect(chunks[0].status).toEqual(IChunkStatus.Missing);
  expect(chunks[1].status).toEqual(IChunkStatus.Ok);
  expect(chunks[2].status).toEqual(IChunkStatus.Missing);
});


