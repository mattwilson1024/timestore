import { Timestore } from './timestore';
import { AUG, endOf, JAN, JUL, NOV, OCT, SEP, startOf } from './test-data/months';
import { IExampleDataItem } from './test-data/example-data-item';
import { SliceStatus } from './models/slice';
import { generateTestData } from './test-data/test-data';
import { addSeconds } from 'date-fns';

describe('Timestore', () => {
  let timestore: Timestore<IExampleDataItem>;

  beforeEach(() => {
    timestore = new Timestore<IExampleDataItem>(
      (dataItem: IExampleDataItem) => dataItem.date
    );
  });

  it('starts empty', () => {
    const slices = timestore.query({
      from: startOf(NOV),
      to: endOf(NOV)
    });

    expect(slices.length).toEqual(1);
    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(NOV));
    expect(slices[0].to).toEqual(endOf(NOV));
    expect(slices[0].isLoading).toEqual(false);
    expect(slices[0].data).toBeUndefined();
  });

  it('Querying for a wider date range than what we have data for results in empty buckets at the start and end', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

    const slices = timestore.query({ from: startOf(JUL), to: endOf(SEP) });

    expect(slices.length).toEqual(3);

    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(JUL));
    expect(slices[0].to).toEqual(endOf(JUL));

    expect(slices[1].status).toEqual(SliceStatus.Filled);
    expect(slices[1].from).toEqual(startOf(AUG));
    expect(slices[1].to).toEqual(endOf(AUG));

    expect(slices[2].status).toEqual(SliceStatus.Empty);
    expect(slices[2].from).toEqual(endOf(AUG));
    expect(slices[2].to).toEqual(endOf(SEP));
  });

  it('Query results covers the entire contiguous requested range and filling any gaps in the stored data with empty buckets', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const slices = timestore.query({ from: startOf(JUL), to: endOf(NOV) });

    expect(slices.length).toEqual(5);

    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(JUL));
    expect(slices[0].to).toEqual(endOf(JUL));

    expect(slices[1].status).toEqual(SliceStatus.Filled);
    expect(slices[1].from).toEqual(startOf(AUG));
    expect(slices[1].to).toEqual(endOf(AUG));

    expect(slices[2].status).toEqual(SliceStatus.Empty);
    expect(slices[2].from).toEqual(endOf(AUG));
    expect(slices[2].to).toEqual(endOf(SEP));

    expect(slices[3].status).toEqual(SliceStatus.Filled);
    expect(slices[3].from).toEqual(startOf(OCT));
    expect(slices[3].to).toEqual(endOf(OCT));

    expect(slices[4].status).toEqual(SliceStatus.Empty);
    expect(slices[4].from).toEqual(endOf(OCT));
    expect(slices[4].to).toEqual(endOf(NOV));
  });

  it('Querying exactly the range for which we have provided data should return one filled bucket', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

    const slices = timestore.query({ from: startOf(AUG), to: endOf(AUG) });

    expect(slices.length).toEqual(1);

    expect(slices[0].status).toEqual(SliceStatus.Filled);
    expect(slices[0].from).toEqual(startOf(AUG));
    expect(slices[0].to).toEqual(endOf(AUG));
  });

  // it('Querying a range for which we only have data for part of it', () => {
  //   timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
  //
  //   const buckets = timestore.query({ from: tenthOf(AUG), to: tenthOf(SEP) });
  //
  //   expect(buckets.length).toEqual(2);
  //
  //   expect(buckets[0].status).toEqual(BucketStatus.Filled);
  //   expect(buckets[0].from).toEqual(tenthOf(AUG));
  //   expect(buckets[0].to).toEqual(endOf(AUG));
  //
  //   expect(buckets[1].status).toEqual(BucketStatus.Empty);
  //   expect(buckets[1].from).toEqual(startOf(SEP));
  //   expect(buckets[1].to).toEqual(tenthOf(SEP));
  // });

  // TODO: Handle clipping the returned response to subsets of the stored chunks
  // TODO: Consider if that's really what you'd actually want - would you also want to know that you have a wider range available??
  // it('After populating data for August, querying for a subset of August should return a clipped bucket', () => {
  //   timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);

  //   const buckets = timestore.query({ from: fifthOf(AUG), to: tenthOf(AUG) });

  //   expect(buckets.length).toEqual(1);

  //   expect(buckets[0].status).toEqual(IBucketStatus.Filled);
  //   expect(buckets[0].from).toEqual(fifthOf(AUG));
  //   expect(buckets[0].to).toEqual(tenthOf(AUG));
  // });

  it('Querying for a range where we have no data should return a single empty bucket (any other stored outside of the requested range is ignored)', () => {
    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), 60);
    timestore.store(startOf(OCT), endOf(OCT), generateTestData(startOf(OCT), endOf(OCT)), 60);

    const slices = timestore.query({ from: startOf(JAN), to: endOf(JAN) });

    expect(slices.length).toEqual(1);

    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(JAN));
    expect(slices[0].to).toEqual(endOf(JAN));
  });

  it('Should return a bucket with expired status if the cache time is exceeded', () => {
    const cacheLengthSeconds = 60;

    timestore.store(startOf(AUG), endOf(AUG), generateTestData(startOf(AUG), endOf(AUG)), cacheLengthSeconds);

    const future = addSeconds(new Date(), cacheLengthSeconds);
    jest.spyOn(Date, 'now').mockImplementation(() => future.valueOf());

    const slices = timestore.query({ from: startOf(AUG), to: endOf(AUG) });

    expect(slices.length).toEqual(1);
    expect(slices[0].status).toEqual(SliceStatus.Expired);
  });

  // it('Querying for a range where we have no data should return a single empty bucket (any other stored outside of the requested range is ignored)', () => {
  //   timestore.store(startOf(JAN), endOf(JAN), generateTestData(startOf(JAN), endOf(JAN)), 60);
  //   timestore.store(startOf(FEB), endOf(FEB), generateTestData(startOf(FEB), endOf(FEB)), 60);
  //   timestore.store(startOf(MAR), endOf(MAR), generateTestData(startOf(MAR), endOf(MAR)), 60);
  //
  //   timestore.invalidate(tenthOf(JAN), tenthOf(MAR));
  //
  //   const buckets = timestore.query({ from: startOf(JAN), to: endOf(MAR) });
  //
  //   expect(buckets.length).toEqual(5);
  //
  //   expect(buckets[0].status).toEqual(BucketStatus.Filled);
  //   expect(buckets[0].from).toEqual(startOf(JAN));
  //   expect(buckets[0].to).toEqual(tenthOf(JAN));
  //
  //   // TODO: Merge these three into one chunk?
  //   expect(buckets[1].status).toEqual(BucketStatus.Expired);
  //   expect(buckets[1].from).toEqual(tenthOf(JAN));
  //   expect(buckets[1].to).toEqual(endOf(JAN));
  //
  //   expect(buckets[2].status).toEqual(BucketStatus.Expired);
  //   expect(buckets[2].from).toEqual(startOf(FEB));
  //   expect(buckets[2].to).toEqual(endOf(FEB));
  //
  //   expect(buckets[3].status).toEqual(BucketStatus.Expired);
  //   expect(buckets[3].from).toEqual(startOf(MAR));
  //   expect(buckets[3].to).toEqual(tenthOf(MAR));
  //
  //   expect(buckets[4].status).toEqual(BucketStatus.Filled);
  //   expect(buckets[4].from).toEqual(tenthOf(MAR));
  //   expect(buckets[4].to).toEqual(endOf(MAR));
  // });

  // it('Should merge together consecutive buckets when they expire', () => {
  //   const cacheLengthSeconds = 60;
  //
  //   timestore.store(startOf(JAN), endOf(JAN), generateTestData(startOf(JAN), endOf(JAN)), cacheLengthSeconds);
  //   timestore.store(startOf(FEB), endOf(FEB), generateTestData(startOf(FEB), endOf(FEB)), cacheLengthSeconds);
  //
  //   const future = moment().add(cacheLengthSeconds, 'seconds');
  //   jest.spyOn(Date, 'now').mockImplementation(() => future.valueOf());
  //
  //   const buckets = timestore.query({ from: startOf(JAN), to: endOf(FEB) });
  //
  //   expect(buckets.length).toEqual(1);
  //   expect(buckets[0].status).toEqual(BucketStatus.Expired);
  //   expect(buckets[0].from).toEqual(startOf(JAN));
  //   expect(buckets[0].to).toEqual(endOf(FEB));
  // });

});
