import { coerceNumberProperty } from '@angular/cdk/coercion';
import { isObject, isNil } from 'ng-primitives/utils';

/**
 * Options for configuring offset between a floating element and its reference element.
 * Can be a single number for uniform offset or an object for axis-specific control.
 */
export interface NgpOffsetOptions {
  /**
   * The offset along the main axis (the axis that runs along the side of the floating element).
   * Represents the distance between the floating element and the reference element.
   * @default 0
   */
  mainAxis?: number;

  /**
   * The offset along the cross axis (the axis that runs along the alignment of the floating element).
   * Represents the skidding between the floating element and the reference element.
   * @default 0
   */
  crossAxis?: number;

  /**
   * Same axis as crossAxis but applies only to aligned placements and inverts the end alignment.
   * When set to a number, it overrides the crossAxis value.
   * @default null
   */
  alignmentAxis?: number | null;
}

/**
 * Type representing all valid offset values.
 * Can be a number (applies to mainAxis) or an object with axis-specific offsets.
 */
export type NgpOffset = number | NgpOffsetOptions;

/**
 * Input type for offset that also accepts string representations of numbers
 */
export type NgpOffsetInput = NgpOffset | string;

/**
 * Transform function to coerce offset input values to the correct type
 * @param value The input value to coerce
 * @returns The coerced offset value
 */
export function coerceOffset(value: NgpOffsetInput | null | undefined): NgpOffset {
  if (isNil(value)) {
    return 0;
  }

  if (isObject(value)) {
    return value;
  }

  // Use CDK's coerceNumberProperty for consistent number coercion
  // This handles strings, numbers, and other input types just like Angular CDK inputs
  return coerceNumberProperty(value, 0);
}
