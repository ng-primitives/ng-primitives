/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * An abstraction that can be used to create and modify date time objects
 * immutably regardless of the underlying implementation.
 */
export interface NgpDateTimeAdapter<T> {
  /**
   * Create a new date time object.
   */
  create(options: NgpDuration): T;

  /**
   * Create a new date with the current date and time.
   */
  now(): T;

  /**
   * Set the year of the date time object based on a duration.
   */
  set(date: T, duration: NgpDuration): T;

  /**
   * Add a duration to the date time object.
   */
  add(date: T, duration: NgpDuration): T;

  /**
   * Subtract a duration from the date time object.
   */
  subtract(date: T, duration: NgpDuration): T;

  /**
   * Compare two date time objects.
   */
  compare(a: T, b: T): number;

  /**
   * Determine if two date objects are on the same day.
   */
  isSameDay(a: T, b: T): boolean;

  /**
   * Determine if two date objects are on the same month.
   */
  isSameMonth(a: T, b: T): boolean;

  /**
   * Determine if two date objects are on the same year.
   */
  isSameYear(a: T, b: T): boolean;

  /**
   * Get the year.
   */
  getYear(date: T): number;

  /**
   * Get the month.
   */
  getMonth(date: T): number;

  /**
   * Get the date.
   */
  getDate(date: T): number;

  /**
   * Get the day.
   */
  getDay(date: T): number;

  /**
   * Get the hours.
   */
  getHours(date: T): number;

  /**
   * Get the minutes.
   */
  getMinutes(date: T): number;

  /**
   * Get the seconds.
   */
  getSeconds(date: T): number;

  /**
   * Get the milliseconds.
   */
  getMilliseconds(date: T): number;

  /**
   * Get the first day of the month.
   */
  getFirstDayOfMonth(date: T): T;

  /**
   * Get the last day of the month.
   */
  getLastDayOfMonth(date: T): T;
}

export interface NgpDuration {
  /**
   * The years.
   */
  years?: number;

  /**
   * The months.
   */
  months?: number;

  /**
   * The days.
   */
  days?: number;

  /**
   * The hours.
   */
  hours?: number;

  /**
   * The minutes.
   */
  minutes?: number;

  /**
   * The seconds.
   */
  seconds?: number;

  /**
   * The milliseconds.
   */
  milliseconds?: number;
}
