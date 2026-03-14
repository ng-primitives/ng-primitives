import { coerceNumberProperty } from '@angular/cdk/coercion';
import { type FlipOptions } from '@floating-ui/dom';
import { isNil, isObject } from 'ng-primitives/utils';

/**
 * Options for configuring flip behavior.
 * Re-exports Floating UI's FlipOptions directly — includes all DetectOverflowOptions
 * (boundary, rootBoundary, padding, elementContext, altBoundary) plus flip-specific
 * options (mainAxis, crossAxis, fallbackPlacements, fallbackStrategy, fallbackAxisSideDirection, flipAlignment).
 */
export type NgpFlipOptions = FlipOptions;

/**
 * Type representing all valid flip values.
 * Can be a boolean (enable/disable), undefined, or an object with detailed options.
 */
export type NgpFlip = boolean | NgpFlipOptions | undefined;

/**
 * Input type for flip that also accepts string representations of booleans
 */
export type NgpFlipInput = NgpFlip | string;

/**
 * Transform function to coerce flip input values to the correct type
 * @param value The input value to coerce
 * @returns The coerced flip value
 */
export function coerceFlip(value: NgpFlipInput | null | undefined): NgpFlip {
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

  // Handle empty attribute values (Angular boolean attribute semantics)
  if (value === '') {
    return true;
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
