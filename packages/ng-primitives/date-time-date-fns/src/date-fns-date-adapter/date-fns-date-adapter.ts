import {
  add as addToDate,
  addMilliseconds,
  compareAsc,
  endOfDay as dateFnsEndOfDay,
  endOfMonth as dateFnsEndOfMonth,
  getDate as dateFnsGetDate,
  getDay as dateFnsGetDay,
  getHours as dateFnsGetHours,
  getMilliseconds as dateFnsGetMilliseconds,
  getMinutes as dateFnsGetMinutes,
  getMonth as dateFnsGetMonth,
  getSeconds as dateFnsGetSeconds,
  getYear as dateFnsGetYear,
  isAfter as dateFnsIsAfter,
  isBefore as dateFnsIsBefore,
  isEqual as dateFnsIsEqual,
  isSameDay as dateFnsIsSameDay,
  isSameMonth as dateFnsIsSameMonth,
  isSameYear as dateFnsIsSameYear,
  set as setOnDate,
  startOfDay as dateFnsStartOfDay,
  startOfMonth as dateFnsStartOfMonth,
  sub as subtractFromDate,
} from 'date-fns';
import { NgpDateAdapter, NgpDateUnits, NgpDuration } from 'ng-primitives/date-time';

export class NgpDateFnsDateAdapter implements NgpDateAdapter<Date> {
  create({ day, hour, minute, month, second, year, millisecond }: NgpDateUnits): Date {
    const now = new Date();

    return new Date(
      year ?? now.getFullYear(),
      month ? month - 1 : now.getMonth(),
      day ?? now.getDate(),
      hour ?? now.getHours(),
      minute ?? now.getMinutes(),
      second ?? now.getSeconds(),
      millisecond ?? now.getMilliseconds(),
    );
  }

  now(): Date {
    return new Date();
  }

  set(date: Date, values: NgpDateUnits): Date {
    return setOnDate(date, {
      year: values.year,
      month: values.month !== undefined ? values.month - 1 : undefined,
      date: values.day,
      hours: values.hour,
      minutes: values.minute,
      seconds: values.second,
      milliseconds: values.millisecond,
    });
  }

  add(date: Date, duration: NgpDuration): Date {
    return addMilliseconds(addToDate(date, duration), duration.milliseconds ?? 0);
  }

  subtract(date: Date, duration: NgpDuration): Date {
    return addMilliseconds(subtractFromDate(date, duration), -(duration.milliseconds ?? 0));
  }

  compare(a: Date, b: Date): number {
    return compareAsc(a, b);
  }

  isEqual(a: Date, b: Date): boolean {
    return dateFnsIsEqual(a, b);
  }

  isBefore(a: Date, b: Date): boolean {
    return dateFnsIsBefore(a, b);
  }

  isAfter(a: Date, b: Date): boolean {
    return dateFnsIsAfter(a, b);
  }

  isSameDay(a: Date, b: Date): boolean {
    return dateFnsIsSameDay(a, b);
  }

  isSameMonth(a: Date, b: Date): boolean {
    return dateFnsIsSameMonth(a, b);
  }

  isSameYear(a: Date, b: Date): boolean {
    return dateFnsIsSameYear(a, b);
  }

  getYear(date: Date): number {
    return dateFnsGetYear(date);
  }

  getMonth(date: Date): number {
    return dateFnsGetMonth(date);
  }

  getDate(date: Date): number {
    return dateFnsGetDate(date);
  }

  getDay(date: Date): number {
    // date-fns returns the day of the week as 0-6 (Sunday-Saturday), remap to 1-7 (Monday-Sunday)
    const day = dateFnsGetDay(date);
    return day === 0 ? 7 : day;
  }

  getHours(date: Date): number {
    return dateFnsGetHours(date);
  }

  getMinutes(date: Date): number {
    return dateFnsGetMinutes(date);
  }

  getSeconds(date: Date): number {
    return dateFnsGetSeconds(date);
  }

  getMilliseconds(date: Date): number {
    return dateFnsGetMilliseconds(date);
  }

  startOfMonth(date: Date): Date {
    return dateFnsStartOfMonth(date);
  }

  endOfMonth(date: Date): Date {
    return dateFnsEndOfMonth(date);
  }

  startOfDay(date: Date): Date {
    return dateFnsStartOfDay(date);
  }

  endOfDay(date: Date): Date {
    return dateFnsEndOfDay(date);
  }
}
