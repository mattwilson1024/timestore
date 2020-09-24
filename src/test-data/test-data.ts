import { Duration } from 'luxon';
import { ISO8601Date } from '../models/date-types';
import { fromUtcIso, toUtcIso } from '../utils/utc-iso-helpers';
import { IExampleDataItem } from './example-data-item';

export function generateTestData(from: ISO8601Date, to: ISO8601Date): IExampleDataItem[] {
  const fromDay = fromUtcIso(from).startOf('day');
  const toDay = fromUtcIso(to).startOf('day');

  if (fromDay > toDay) {
    throw new Error(`Cannot generate test data for this range because the end date is before the start date`);
  }

  let dataItems: IExampleDataItem[] = [];
  let day = fromDay;
  while (day.equals(toDay) || day.equals(toDay)) {
    dataItems.push({
      date: toUtcIso(day),
      numberOfCatGifs: (day.month * 100) + day.day // e.g. for November, this is month 11 * 100 + day 1 = 1101
    });
    day = day.plus(Duration.fromObject({ days: 1 }));
  }

  return dataItems;
}
