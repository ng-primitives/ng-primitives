import { coerceNumberProperty } from '@angular/cdk/coercion';
import { isNil, isObject } from 'ng-primitives/utils';

/**
 * Options for configuring shift behavior to keep the floating element in view.
 * The shift middleware ensures the floating element stays visible by shifting it
 * within the viewport when it would otherwise overflow.
 */
export interface NgpShiftOptions {
  /**
   * The minimum padding between the floating element and the viewport edges.
   * Prevents the floating element from touching the edges of the viewport.
   * @default 0
   */
  padding?: number;

  /**
   * The limiter function that determines how much the floating element can shift.
   * Common limiters from @floating-ui/dom include:
   * - limitShift: Limits shifting to prevent the reference element from being obscured
   * @default undefined
   */
  limiter?: {
    fn: (state: unknown) => { x: number; y: number };
    options?: unknown;
  };
}

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
