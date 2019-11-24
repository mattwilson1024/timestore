import moment = require('moment');
import { Moment } from 'moment';
import { IDateRange } from '../models/date-types';

interface IMomentRange {
  start: Moment;
  end: Moment;
}

function createMomentRange(range: IDateRange): IMomentRange {
  return {
    start: moment(range.start),
    end: moment(range.end)
  };
}

export function getDateRangeIntersection(range1: IDateRange, range2: IDateRange): IDateRange | null {
  const r1 = createMomentRange(range1);
  const r2 = createMomentRange(range2);

  const isR1Earliest = r1.start.isSameOrBefore(r2.start);
  const firstRange = isR1Earliest ? r1 : r2;
  const secondRange = isR1Earliest ? r2 : r1;

  if (secondRange.start.isAfter(firstRange.end)) {
    return null;
  }

  const intersectionStart = secondRange.start;
  const intersectionEnd = secondRange.end.isBefore(firstRange.end) ? secondRange.end : firstRange.end;

  return {
    start: intersectionStart.toISOString(),
    end: intersectionEnd.toISOString()
  };
}

export function doRangesIntersect(range1: IDateRange, range2: IDateRange): boolean {
  return getDateRangeIntersection(range1, range2) !== null;
}