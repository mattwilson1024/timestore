import { Timestore } from './timestore';
import { IBucketStatus } from './models/bucket';
import { generateTestData } from './test-data/test-data';
import { startOf, endOf, fifthOf, tenthOf, JAN, JUL, AUG, SEP, OCT, NOV } from './test-data/months';
import { IExampleDataItem } from './test-data/example-data-item';

describe('Timestore', () => {
  let timestore: Timestore<IExampleDataItem>;

  beforeEach(() => {
    timestore = new Timestore<IExampleDataItem>(
      (dataItem: IExampleDataItem) => dataItem.date
    );
  });

  test('starts empty', () => {
    const buckets = timestore.query({
      from: startOf(NOV),
      to: endOf(NOV)
    });

    expect(buckets.length).toEqual(1);
    expect(buckets[0].status).toEqual(IBucketStatus.Empty);
    expect(buckets[0].from).toEqual(startOf(NOV));
    expect(buckets[0].to).toEqual(endOf(NOV));
    expect(buckets[0].isLoading).toEqual(false);
    expect(buckets[0].data).toBeUndefined();
  });

  test('Querying for a wider date range than what we have data for results in empty buckets at the start and end', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    
    const buckets = timestore.query({ from: startOf(JUL), to: endOf(SEP) });

    expect(buckets.length).toEqual(3);

    expect(buckets[0].status).toEqual(IBucketStatus.Empty);
    expect(buckets[0].from).toEqual(startOf(JUL));
    expect(buckets[0].to).toEqual(endOf(JUL));
    
    expect(buckets[1].status).toEqual(IBucketStatus.Filled);
    expect(buckets[1].from).toEqual(startOf(AUG));
    expect(buckets[1].to).toEqual(endOf(AUG));

    expect(buckets[2].status).toEqual(IBucketStatus.Empty);
    expect(buckets[2].from).toEqual(startOf(SEP));
    expect(buckets[2].to).toEqual(endOf(SEP));
  });


  test('Query results covers the entire contiguous requested range and filling any gaps in the stored data with empty buckets', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const buckets = timestore.query({ from: startOf(JUL), to: endOf(NOV) });

    expect(buckets.length).toEqual(5);

    expect(buckets[0].status).toEqual(IBucketStatus.Empty);
    expect(buckets[0].from).toEqual(startOf(JUL));
    expect(buckets[0].to).toEqual(endOf(JUL));
    
    expect(buckets[1].status).toEqual(IBucketStatus.Filled);
    expect(buckets[1].from).toEqual(startOf(AUG));
    expect(buckets[1].to).toEqual(endOf(AUG));

    expect(buckets[2].status).toEqual(IBucketStatus.Empty);
    expect(buckets[2].from).toEqual(startOf(SEP));
    expect(buckets[2].to).toEqual(endOf(SEP));

    expect(buckets[3].status).toEqual(IBucketStatus.Filled);
    expect(buckets[3].from).toEqual(startOf(OCT));
    expect(buckets[3].to).toEqual(endOf(OCT));

    expect(buckets[4].status).toEqual(IBucketStatus.Empty);
    expect(buckets[4].from).toEqual(startOf(NOV));
    expect(buckets[4].to).toEqual(endOf(NOV));
  });


  test('Querying exactly the range for which we have provided data should return one filled bucket', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

    const buckets = timestore.query({ from: startOf(AUG), to: endOf(AUG) });

    expect(buckets.length).toEqual(1);

    expect(buckets[0].status).toEqual(IBucketStatus.Filled);
    expect(buckets[0].from).toEqual(startOf(AUG));
    expect(buckets[0].to).toEqual(endOf(AUG));
  });

  // TODO: Handle clipping the returned response to subsets of the stored chunks
  // TODO: Consider if that's really what you'd actually want - would you also want to know that you have a wider range available??
  test('After populating data for August, querying for a subset of August should return a clipped bucket', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

    const buckets = timestore.query({ from: fifthOf(AUG), to: tenthOf(AUG) });

    expect(buckets.length).toEqual(1);

    expect(buckets[0].status).toEqual(IBucketStatus.Filled);
    expect(buckets[0].from).toEqual(fifthOf(AUG));
    expect(buckets[0].to).toEqual(tenthOf(AUG));
  });

  test('Querying for a range where we have no data should return a single empty bucket (any other stored outside of the requested range is ignored)', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const buckets = timestore.query({ from: startOf(JAN), to: endOf(JAN) });

    expect(buckets.length).toEqual(1);

    expect(buckets[0].status).toEqual(IBucketStatus.Empty);
    expect(buckets[0].from).toEqual(startOf(JAN));
    expect(buckets[0].to).toEqual(endOf(JAN));
  });

});
