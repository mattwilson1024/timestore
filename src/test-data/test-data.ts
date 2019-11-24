import moment = require('moment');

import { ISO8601Date } from '../models/date-types';
import { IExampleDataItem } from './example-data-item';

export function generateTestData(from: ISO8601Date, to: ISO8601Date): IExampleDataItem[] {
  const fromDay = moment(from).startOf('day');
  const toDay = moment(to).startOf('day');

  if (fromDay.isAfter(toDay)) {
    throw new Error(`Cannot generate test data for this range because the end date is before the start date`);
  }

  let dataItems: IExampleDataItem[] = [];
  let day = fromDay.clone();
  while (day.isSameOrBefore(toDay)) {
    dataItems.push({
      date: day.toISOString(),
      numberOfCatGifs: ((day.month() + 1) * 100) + day.date() // e.g. for November, this is (11 * 100) + 1 = 1101
    });
    day.add(1, 'day');
  }

  return dataItems;
}
