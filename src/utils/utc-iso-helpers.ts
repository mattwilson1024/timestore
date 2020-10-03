import { DateTime } from 'luxon';
import { ISO8601Date } from '../models/date-types';

export function fromUtcIso(isoString: ISO8601Date): DateTime {
  return DateTime.fromISO(isoString, { zone: 'utc' });
}

export function toUtcIso(date: DateTime): ISO8601Date {
  return date.toUTC().toISO();
}
