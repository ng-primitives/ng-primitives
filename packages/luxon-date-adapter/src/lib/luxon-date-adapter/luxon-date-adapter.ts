import { DateTime } from 'luxon';
import { NgpDateAdapter, NgpDateUnits, NgpDuration } from 'ng-primitives/date-time';

export class NgpLuxonDateAdapter implements NgpDateAdapter<DateTime> {
  now() {
    return DateTime.now();
  }

  set(date: DateTime, values: NgpDateUnits) {
    return date.set(values);
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
    return date.month;
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
    return DateTime.fromObject(values);
  }
}
