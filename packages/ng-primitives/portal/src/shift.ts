import { coerceNumberProperty } from '@angular/cdk/coercion';
import { type ShiftOptions } from '@floating-ui/dom';
import { isNil, isObject } from 'ng-primitives/utils';

/**
 * Options for configuring shift behavior.
 * Re-exports Floating UI's ShiftOptions directly — includes all DetectOverflowOptions
 * (boundary, rootBoundary, padding, elementContext, altBoundary) plus shift-specific
 * options (mainAxis, crossAxis, limiter).
 */
export type NgpShiftOptions = ShiftOptions;

/**
 * Type representing all valid shift values.
 * Can be a boolean (enable/disable), undefined, or an object with detailed options.
 */
export type NgpShift = boolean | NgpShiftOptions | undefined;

/**
 * Input type for shift that also accepts string representations of booleans
 */
export type NgpShiftInput = NgpShift | string;

/**
 * Transform function to coerce shift input values to the correct type
 * @param value The input value to coerce
 * @returns The coerced shift value
 */
export function coerceShift(value: NgpShiftInput | null | undefined): NgpShift {
  if (isNil(value)) {
    return undefined;
  }

  if (isObject(value)) {
    return value;
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value;
  }

  // Handle string boolean values
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  // Handle string number values for padding shorthand
  const numValue = coerceNumberProperty(value, null);
  if (numValue !== null && !isNaN(numValue)) {
    return { padding: numValue };
  }

  return undefined;
}
