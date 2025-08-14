import { NgpDateAdapter, NgpDateUnits, NgpDuration } from '../date-adapter/date-adapter';

export class NgpNativeDateAdapter implements NgpDateAdapter<Date> {
  /**
   * Create a new date time object.
   */
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

  /**
   * Create a new date with the current date and time.
   */
  now(): Date {
    return new Date();
  }

  /**
   * Set the year of the date time object based on a duration.
   */
  set(date: Date, values: NgpDateUnits): Date {
    return new Date(
      values.year ?? date.getFullYear(),
      values.month ?? date.getMonth(),
      values.day ?? date.getDate(),
      values.hour ?? date.getHours(),
      values.minute ?? date.getMinutes(),
      values.second ?? date.getSeconds(),
      values.millisecond ?? date.getMilliseconds(),
    );
  }

  /**
   * Add a duration to the date time object.
   */
  add(date: Date, duration: NgpDuration): Date {
    return new Date(
      date.getFullYear() + (duration.years ?? 0),
      date.getMonth() + (duration.months ?? 0),
      date.getDate() + (duration.days ?? 0),
      date.getHours() + (duration.hours ?? 0),
      date.getMinutes() + (duration.minutes ?? 0),
      date.getSeconds() + (duration.seconds ?? 0),
      date.getMilliseconds() + (duration.milliseconds ?? 0),
    );
  }

  /**
   * Subtract a duration from the date time object
   */
  subtract(date: Date, duration: NgpDuration): Date {
    return new Date(
      date.getFullYear() - (duration.years ?? 0),
      date.getMonth() - (duration.months ?? 0),
      date.getDate() - (duration.days ?? 0),
      date.getHours() - (duration.hours ?? 0),
      date.getMinutes() - (duration.minutes ?? 0),
      date.getSeconds() - (duration.seconds ?? 0),
      date.getMilliseconds() - (duration.milliseconds ?? 0),
    );
  }

  /**
   * Compare two date time objects
   */
  compare(a: Date, b: Date): number {
    const diff = a.getTime() - b.getTime();
    return diff === 0 ? 0 : diff > 0 ? 1 : -1;
  }

  /**
   * Determine if two date time objects are equal.
   */
  isEqual(a: Date, b: Date): boolean {
    return a.getTime() === b.getTime();
  }

  /**
   * Determine if a date time object is before another.
   */
  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  }

  /**
   * Determine if a date time object is after another.
   */
  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime();
  }

  /**
   * Determine if two date objects are on the same day.
   */
  isSameDay(a: Date, b: Date): boolean {
    return this.isSameYear(a, b) && this.isSameMonth(a, b) && a.getDate() === b.getDate();
  }

  /**
   * Determine if two date objects are on the same month.
   */
  isSameMonth(a: Date, b: Date): boolean {
    return this.isSameYear(a, b) && a.getMonth() === b.getMonth();
  }

  /**
   * Determine if two date objects are on the same year.
   */
  isSameYear(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear();
  }

  /**
   * Get the year.
   */
  getYear(date: Date): number {
    return date.getFullYear();
  }

  /**
   * Get the month.
   */
  getMonth(date: Date): number {
    return date.getMonth();
  }

  /**
   * Get the day of the week as a number (1-7).
   * - `1` = Monday
   * - `2` = Tuesday
   * - `3` = Wednesday
   * - `4` = Thursday
   * - `5` = Friday
   * - `6` = Saturday
   * - `7` = Sunday
   */
  getDay(date: Date): number {
    return date.getDay() === 0 ? 7 : date.getDay();
  }

  /**
   * Get the date.
   */
  getDate(date: Date): number {
    return date.getDate();
  }

  /**
   * Get the hours.
   */
  getHours(date: Date): number {
    return date.getHours();
  }

  /**
   * Get the minutes.
   */
  getMinutes(date: Date): number {
    return date.getMinutes();
  }

  /**
   * Get the seconds.
   */
  getSeconds(date: Date): number {
    return date.getSeconds();
  }

  /**
   * Get the milliseconds.
   */
  getMilliseconds(date: Date): number {
    return date.getMilliseconds();
  }

  /**
   * Get the first day of the month.
   */
  startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Get the last day of the month.
   */
  endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Get the start of the day.
   */
  startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Get the end of the day.
   */
  endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }
}
