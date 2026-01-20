---
name: 'Date Adapter'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/utilities/date-adapter'
---

# Date Adapter

The Date Adapter is an abstraction layer that allows components to use date objects from any date library, ensuring compatibility and easy integration.

## Import

Import the DateAdapter from `ng-primitives/date-time`.

```ts
import { NgpLuxonDateAdapter } from 'ng-primitives/date-time-lucon';
import { NgpDateAdapter, NgpNativeDateAdapter } from 'ng-primitives/date-time-luxon';
```

## Usage

Angular Primitives ships with two date adapters out of the box: `NgpNativeDateAdapter` and `NgpLuxonDateAdapter`.
The `NgpNativeDateAdapter` uses the native JavaScript `Date` object, while the `NgpLuxonDateAdapter` uses the Luxon date library.

To use a date adapter, you need to provide it to Angular's dependency injection system. This can be done once at the root of your application or at a component/module level.

```ts
bootstrapApplication(AppComponent, {
  providers: [provideDateAdapter(NgpLuxonDateAdapter)],
});
```

If no date adapter is provided, the `NgpNativeDateAdapter` will be used by default.

Should you need to use a different date library, you can create your own date adapter by implementing the `NgpDateAdapter` interface.

Should you wish to use the adapter in a component, you can inject it into a component.

```ts
import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { injectDateAdapter } from 'ng-primitives/date-time';

@Component({
  selector: 'app-root',
  template: `
    ...
  `,
})
export class AppComponent {
  private readonly dateAdapter = injectDateAdapter<DateTime>();
}
```

## API Reference

All date adapters must implement the `NgpDateAdapter` interface.

```ts
interface NgpDateAdapter<T> {
  /**
   * Create a new date time object.
   */
  create(values: NgpDateUnits): T;

  /**
   * Create a new date with the current date and time.
   */
  now(): T;

  /**
   * Set the year of the date time object based on a duration.
   */
  set(date: T, values: NgpDateUnits): T;

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
   * Determine if two date time objects are equal.
   */
  isEqual(a: T, b: T): boolean;

  /**
   * Determine if a date time object is before another.
   */
  isBefore(a: T, b: T): boolean;

  /**
   * Determine if a date time object is after another.
   */
  isAfter(a: T, b: T): boolean;

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
  startOfMonth(date: T): T;

  /**
   * Get the last day of the month.
   */
  endOfMonth(date: T): T;

  /**
   * Get the start of the day.
   */
  startOfDay(date: T): T;

  /**
   * Get the end of the day.
   */
  endOfDay(date: T): T;
}
```
