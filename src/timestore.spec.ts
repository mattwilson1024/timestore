import { Timestore } from './timestore';
import { IChunkStatus } from './models/chunk';
import { generateTestData } from './test-data/test-data';

const OCT_START = '2019-10-01T00:00:00Z';
const NOV_1 = '2019-11-01T00:00:00Z';
const NOV_30 = '2019-11-30T00:00:00Z';
const DEC_31 = '2019-12-31T00:00:00Z';

test('starts empty', () => {
  const timestore = new Timestore();

  const chunks = timestore.query({
    from: NOV_1,
    to: NOV_30
  });

  expect(chunks.length).toEqual(1);
  expect(chunks[0].status).toEqual(IChunkStatus.Missing);
  expect(chunks[0].from).toEqual(NOV_1);
  expect(chunks[0].to).toEqual(NOV_30);
  expect(chunks[0].isLoading).toEqual(false);
  expect(chunks[0].data).toBeUndefined();
});

test('Allows storing data', () => {
  const timestore = new Timestore();

  const novData = generateTestData(NOV_1, NOV_30);

  timestore.store(NOV_1, NOV_30, novData, 60);
  
  const chunks = timestore.query({
    from: OCT_START,
    to: DEC_31
  });

  expect(chunks.length).toEqual(3);
  expect(chunks[0].status).toEqual(IChunkStatus.Missing);
  expect(chunks[1].status).toEqual(IChunkStatus.Ok);
  expect(chunks[2].status).toEqual(IChunkStatus.Missing);
});


