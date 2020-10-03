import { SliceStatus } from './models/slice';
import { IExampleDataItem } from './test-data/example-data-item';
import { APR, AUG, endOf, JUL, JUN, MAY, OCT, SEP, startOf } from './test-data/months';
import { generateTestData } from './test-data/test-data';
import { Timestore } from './timestore';

describe('Timestore with Max Chunk Size', () => {
  let timestore: Timestore<IExampleDataItem>;

  beforeEach(() => {
    timestore = new Timestore<IExampleDataItem>({
      getTimestampFunction: (dataItem: IExampleDataItem) => dataItem.date,
      maxChunkSize: {
        amount: 1,
        unit: 'month'
      }
    });
  });

  it('returns slices that are no larger than the configured maxChunkSize', () => {
    const slices = timestore.query({
      from: startOf(MAY),
      to: endOf(AUG)
    });

    expect(slices.length).toEqual(4);

    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(MAY));
    expect(slices[0].to).toEqual(endOf(MAY));

    expect(slices[1].status).toEqual(SliceStatus.Empty);
    expect(slices[1].from).toEqual(startOf(JUN));
    expect(slices[1].to).toEqual(endOf(JUN));

    expect(slices[2].status).toEqual(SliceStatus.Empty);
    expect(slices[2].from).toEqual(startOf(JUL));
    expect(slices[2].to).toEqual(endOf(JUL));

    expect(slices[3].status).toEqual(SliceStatus.Empty);
    expect(slices[3].from).toEqual(startOf(AUG));
    expect(slices[3].to).toEqual(endOf(AUG));
  });

  it('returns slices that are no larger than the configured maxChunkSize', () => {
    // With the store empty, we should get one empty slice for each month
    const originalSlices = timestore.query({
      from: startOf(APR),
      to: endOf(OCT)
    });

    expect(originalSlices.length).toEqual(7);
    expect(originalSlices.every(slice => slice.status === SliceStatus.Empty)).toBe(true);

    // Now imagine that the app has gone off and loaded slices 3-5 (June, July & August)
    originalSlices.slice(2, 5).forEach(slice => {
      timestore.store(slice.from, slice.to, generateTestData(slice.from, slice.to), 60);
    });

    // Now lets run a new query on the store
    const slices = timestore.query({
      from: startOf(APR),
      to: endOf(OCT)
    });

    // console.log(slices);

    expect(slices.length).toEqual(7);

    expect(slices[0].status).toEqual(SliceStatus.Empty);
    expect(slices[0].from).toEqual(startOf(APR));
    expect(slices[0].to).toEqual(endOf(APR));

    expect(slices[1].status).toEqual(SliceStatus.Empty);
    expect(slices[1].from).toEqual(startOf(MAY));
    expect(slices[1].to).toEqual(endOf(MAY));

    expect(slices[2].status).toEqual(SliceStatus.Filled);
    expect(slices[2].from).toEqual(startOf(JUN));
    expect(slices[2].to).toEqual(endOf(JUN));

    expect(slices[3].status).toEqual(SliceStatus.Filled);
    expect(slices[3].from).toEqual(startOf(JUL));
    expect(slices[3].to).toEqual(endOf(JUL));

    expect(slices[4].status).toEqual(SliceStatus.Filled);
    expect(slices[4].from).toEqual(startOf(AUG));
    expect(slices[4].to).toEqual(endOf(AUG));

    expect(slices[5].status).toEqual(SliceStatus.Empty);
    expect(slices[5].from).toEqual(startOf(SEP));
    expect(slices[5].to).toEqual(endOf(SEP));

    expect(slices[6].status).toEqual(SliceStatus.Empty);
    expect(slices[6].from).toEqual(startOf(OCT));
    expect(slices[6].to).toEqual(endOf(OCT));
  });

});
