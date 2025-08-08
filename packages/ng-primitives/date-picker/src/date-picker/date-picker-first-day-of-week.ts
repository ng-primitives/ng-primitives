import { numberAttribute } from '@angular/core';

/**
 * The first day of the week as a number (0-7).
 * - `1` = Monday
 * - `2` = Tuesday
 * - `3` = Wednesday
 * - `4` = Thursday
 * - `5` = Friday
 * - `6` = Saturday
 * - `7` = Sunday
 */
export type NgpDatePickerFirstDayOfWeekNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * The first day of the week as a number (0-7).
 * - `1` = Monday
 * - `2` = Tuesday
 * - `3` = Wednesday
 * - `4` = Thursday
 * - `5` = Friday
 * - `6` = Saturday
 * - `7` = Sunday
 */
export type NgpDatePickerFirstDayOfWeekNumberInput =
  | NgpDatePickerFirstDayOfWeekNumber
  | `${NgpDatePickerFirstDayOfWeekNumber}`;

/**
 * Transform the first day of the week input value to a number (0-7) for the start of the week in
 * the calendar.
 * @param firstDayOfWeek The first day of the week input value (number).
 * @returns The first day of the week number.
 */
export function transformToFirstDayOfWeekNumber(
  firstDayOfWeek: NgpDatePickerFirstDayOfWeekNumberInput,
): NgpDatePickerFirstDayOfWeekNumber {
  if (!firstDayOfWeek) {
    return 7;
  }
  return numberAttribute(firstDayOfWeek) as NgpDatePickerFirstDayOfWeekNumber;
}
