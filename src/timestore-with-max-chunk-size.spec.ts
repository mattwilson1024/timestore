import { SliceStatus } from './models/slice';
import { IExampleDataItem } from './test-data/example-data-item';
import { AUG, endOf, JUL, JUN, MAY, startOf } from './test-data/months';
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

    console.log(slices);

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

});
