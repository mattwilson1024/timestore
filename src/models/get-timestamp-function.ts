import { ISO8601Date } from './date-types';

/**
 * In order to allow the library to be agnostic to the type of data stored within it does not insist on data conforming
 * to a particular type but instead requires that the consumer implement a `GetTimestampFunction` which, given a data item
 * will extract the timestamp representing that data item (in the format of an ISO8601 date)
 */
export type GetTimestampFunction<T = any> = (dataItem: T) => ISO8601Date;
