import { addDays, getDate, getMonth, isAfter, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import { ISO8601Date } from '../models/date-types';
import { IExampleDataItem } from './example-data-item';

export function generateTestData(from: ISO8601Date, to: ISO8601Date): IExampleDataItem[] {
  const fromDay = startOfDay(parseISO(from));
  const toDay = startOfDay(parseISO(to));

  if (isAfter(fromDay, toDay)) {
    throw new Error(`Cannot generate test data for this range because the end date is before the start date`);
  }

  let dataItems: IExampleDataItem[] = [];
  let day = fromDay;
  while (isEqual(day, toDay) || isBefore(day, toDay)) {
    dataItems.push({
      date: day.toISOString(),
      numberOfCatGifs: ((getMonth(day) + 1) * 100) + getDate(day) // e.g. for November, this is (11 * 100) + 1 = 1101
    });
    day = addDays(day, 1);
  }

  return dataItems;
}
