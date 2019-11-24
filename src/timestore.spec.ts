import { Timestore } from './timestore';
import { IChunkStatus } from './models/chunk';
import { generateTestData } from './test-data/test-data';
import { startOf, endOf, fifthOf, tenthOf, JAN, JUL, AUG, SEP, OCT, NOV } from './test-data/months';

describe('Timestore', () => {
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

  test('Querying for a wider date range than what we have data for results in "missing" chunks at the start and end', () => {
    const timestore = new Timestore();

    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    
    const chunks = timestore.query({ from: startOf(JUL), to: endOf(SEP) });

    expect(chunks.length).toEqual(3);

    expect(chunks[0].status).toEqual(IChunkStatus.Missing);
    expect(chunks[0].from).toEqual(startOf(JUL));
    expect(chunks[0].to).toEqual(endOf(JUL));
    
    expect(chunks[1].status).toEqual(IChunkStatus.Ok);
    expect(chunks[1].from).toEqual(startOf(AUG));
    expect(chunks[1].to).toEqual(endOf(AUG));

    expect(chunks[2].status).toEqual(IChunkStatus.Missing);
    expect(chunks[2].from).toEqual(startOf(SEP));
    expect(chunks[2].to).toEqual(endOf(SEP));
  });


  test('Query results covers the entire contiguous requested range and filling any gaps in the stored data with "missing" chunks', () => {
    const timestore = new Timestore();

    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const chunks = timestore.query({ from: startOf(JUL), to: endOf(NOV) });

    expect(chunks.length).toEqual(5);

    expect(chunks[0].status).toEqual(IChunkStatus.Missing);
    expect(chunks[0].from).toEqual(startOf(JUL));
    expect(chunks[0].to).toEqual(endOf(JUL));
    
    expect(chunks[1].status).toEqual(IChunkStatus.Ok);
    expect(chunks[1].from).toEqual(startOf(AUG));
    expect(chunks[1].to).toEqual(endOf(AUG));

    expect(chunks[2].status).toEqual(IChunkStatus.Missing);
    expect(chunks[2].from).toEqual(startOf(SEP));
    expect(chunks[2].to).toEqual(endOf(SEP));

    expect(chunks[3].status).toEqual(IChunkStatus.Ok);
    expect(chunks[3].from).toEqual(startOf(OCT));
    expect(chunks[3].to).toEqual(endOf(OCT));

    expect(chunks[4].status).toEqual(IChunkStatus.Missing);
    expect(chunks[4].from).toEqual(startOf(NOV));
    expect(chunks[4].to).toEqual(endOf(NOV));
  });


  test('Querying exactly the range for which we have provided data should return one "ok" chunk', () => {
    const timestore = new Timestore();

    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

    const chunks = timestore.query({ from: startOf(AUG), to: endOf(AUG) });

    expect(chunks.length).toEqual(1);

    expect(chunks[0].status).toEqual(IChunkStatus.Ok);
    expect(chunks[0].from).toEqual(startOf(AUG));
    expect(chunks[0].to).toEqual(endOf(AUG));
  });


  // TODO: Handle clipping the returned response to subsets of the stored chunks
  // TODO: Consider if that's really what you'd actually want - would you also want to know that you have a wider range available??
  // test('After populating data for August, querying for a subset of August should return a clipped chunk', () => {
  //   const timestore = new Timestore();

  //   timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

  //   const chunks = timestore.query({ from: fifthOf(AUG), to: tenthOf(AUG) });

  //   expect(chunks.length).toEqual(1);

  //   expect(chunks[0].status).toEqual(IChunkStatus.Ok);
  //   expect(chunks[0].from).toEqual(fifthOf(AUG));
  //   expect(chunks[0].to).toEqual(tenthOf(AUG));
  // });

  test('Querying for a range where we have no data should return a single "missing" chunk (any other stored outside of the requested range is ignored)', () => {
    const timestore = new Timestore();

    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const chunks = timestore.query({ from: startOf(JAN), to: endOf(JAN) });

    expect(chunks.length).toEqual(1);

    expect(chunks[0].status).toEqual(IChunkStatus.Missing);
    expect(chunks[0].from).toEqual(startOf(JAN));
    expect(chunks[0].to).toEqual(endOf(JAN));
  });
  
});
