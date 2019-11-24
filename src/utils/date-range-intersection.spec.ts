import { IDateRange } from '../models/date-types';
import { getDateRangeIntersection, doRangesIntersect } from './date-range-intersection';

describe('Date range intersection', () => {
  it('should return the whole range if both provided ranges are the same', () => {
    const range1: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    const range2: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    const expected: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    
    expect(doRangesIntersect(range1, range2)).toEqual(true);

    const intersection = getDateRangeIntersection(range1, range2);
    expect(intersection.start).toEqual(expected.start);
    expect(intersection.end).toEqual(expected.end);

    expect(getDateRangeIntersection(range1, range2)).toEqual(getDateRangeIntersection(range2, range1));
  });

  it('should return the correct intersection if one range is complete contained within the other', () => {
    const range1: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    const range2: IDateRange = { start: '2019-11-11T00:00:00.000Z', end: '2019-11-14T00:00:00.000Z' };
    const expected: IDateRange = { start: '2019-11-11T00:00:00.000Z', end: '2019-11-14T00:00:00.000Z' };
    
    expect(doRangesIntersect(range1, range2)).toEqual(true);

    const intersection = getDateRangeIntersection(range1, range2);
    expect(intersection.start).toEqual(expected.start);
    expect(intersection.end).toEqual(expected.end);

    expect(getDateRangeIntersection(range1, range2)).toEqual(getDateRangeIntersection(range2, range1));
  });

  it('should return the correct intersection if one range extends past the end of the other', () => {
    const range1: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    const range2: IDateRange = { start: '2019-11-11T00:00:00.000Z', end: '2019-11-28T00:00:00.000Z' };
    const expected: IDateRange = { start: '2019-11-11T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    
    expect(doRangesIntersect(range1, range2)).toEqual(true);

    const intersection = getDateRangeIntersection(range1, range2);
    expect(intersection.start).toEqual(expected.start);
    expect(intersection.end).toEqual(expected.end);

    expect(getDateRangeIntersection(range1, range2)).toEqual(getDateRangeIntersection(range2, range1));
  });

  it('should return the correct intersection if one range starts before the other', () => {
    const range1: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    const range2: IDateRange = { start: '2019-11-01T00:00:00.000Z', end: '2019-11-28T00:00:00.000Z' };
    const expected: IDateRange = { start: '2019-11-02T00:00:00.000Z', end: '2019-11-22T00:00:00.000Z' };
    
    expect(doRangesIntersect(range1, range2)).toEqual(true);

    const intersection = getDateRangeIntersection(range1, range2);
    expect(intersection.start).toEqual(expected.start);
    expect(intersection.end).toEqual(expected.end);

    expect(getDateRangeIntersection(range1, range2)).toEqual(getDateRangeIntersection(range2, range1));
  });

  it('should return null if there is no overlap between the two ranges', () => {
    const range1: IDateRange = { start: '2019-08-16T00:00:00.000Z', end: '2019-08-19T00:00:00.000Z' };
    const range2: IDateRange = { start: '2019-11-01T00:00:00.000Z', end: '2019-11-28T00:00:00.000Z' };
    
    expect(doRangesIntersect(range1, range2)).toEqual(false);
    expect(getDateRangeIntersection(range1, range2)).toBeNull();
    expect(getDateRangeIntersection(range2, range1)).toBeNull();
  });


})
