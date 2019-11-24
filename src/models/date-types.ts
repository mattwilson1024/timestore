export type ISO8601Date = string;
export type ISO8601Duration = string;
export type UnixTimestamp = number;

export interface IDateRange {
  start: ISO8601Date;
  end: ISO8601Date;
}
