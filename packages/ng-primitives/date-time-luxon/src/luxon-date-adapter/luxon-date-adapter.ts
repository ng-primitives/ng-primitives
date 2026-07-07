import { DateTime } from 'luxon';
import { NgpDateAdapter, NgpDateUnits, NgpDuration } from 'ng-primitives/date-time';

export class NgpLuxonDateAdapter implements NgpDateAdapter<DateTime> {
  now() {
    return DateTime.now();
  }

  set(date: DateTime, values: NgpDateUnits) {
    // The adapter uses a 0-11 month (matching the native adapter), but Luxon is 1-12.
    const { month, ...rest } = values;
    return date.set(month !== undefined ? { ...rest, month: month + 1 } : rest);
  }

  add(date: DateTime, duration: NgpDuration) {
    return date.plus(duration);
  }

  subtract(date: DateTime, duration: NgpDuration) {
    return date.minus(duration);
  }

  compare(a: DateTime, b: DateTime): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  isEqual(a: DateTime, b: DateTime): boolean {
    return a.equals(b);
  }

  isBefore(a: DateTime, b: DateTime): boolean {
    return a < b;
  }

  isAfter(a: DateTime, b: DateTime): boolean {
    return a > b;
  }

  isSameDay(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'day') && a.hasSame(b, 'month') && a.hasSame(b, 'year');
  }

  isSameMonth(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'month') && a.hasSame(b, 'year');
  }

  isSameYear(a: DateTime, b: DateTime): boolean {
    return a.hasSame(b, 'year');
  }

  getYear(date: DateTime): number {
    return date.year;
  }

  getMonth(date: DateTime): number {
    // Luxon is 1-12; the adapter contract uses a 0-11 month (matching the native adapter).
    return date.month - 1;
  }

  getDate(date: DateTime): number {
    return date.day;
  }

  getDay(date: DateTime): number {
    return date.weekday;
  }

  getHours(date: DateTime): number {
    return date.hour;
  }

  getMinutes(date: DateTime): number {
    return date.minute;
  }

  getSeconds(date: DateTime): number {
    return date.second;
  }

  getMilliseconds(date: DateTime): number {
    return date.millisecond;
  }

  startOfMonth(date: DateTime) {
    return date.startOf('month');
  }

  endOfMonth(date: DateTime) {
    return date.endOf('month');
  }

  startOfDay(date: DateTime) {
    return date.startOf('day');
  }

  endOfDay(date: DateTime) {
    return date.endOf('day');
  }

  create(values: NgpDateUnits) {
    // Match the native adapter: unspecified units default to the current date/time
    // (month uses a truthy check, so 0 falls back to now like `new Date(...)`).
    const now = DateTime.now();
    const month = values.month || now.month;
    const day = values.day ?? now.day;

    // Build from a valid anchor and apply the units as durations so out-of-range
    // values roll over like the native Date constructor (e.g. month 13 -> next
    // January, day 0 -> last day of the previous month).
    return DateTime.fromObject({ year: values.year ?? now.year, month: 1, day: 1 }).plus({
      months: month - 1,
      days: day - 1,
      hours: values.hour ?? now.hour,
      minutes: values.minute ?? now.minute,
      seconds: values.second ?? now.second,
      milliseconds: values.millisecond ?? now.millisecond,
    });
  }
}
