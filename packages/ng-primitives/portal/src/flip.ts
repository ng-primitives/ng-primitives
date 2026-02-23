import { coerceNumberProperty } from '@angular/cdk/coercion';
import { type Placement } from '@floating-ui/dom';
import { isNil, isObject } from 'ng-primitives/utils';

/**
 * Options for configuring flip behavior to keep the floating element in view.
 * The flip middleware ensures the floating element flips to the opposite side
 * when it would otherwise overflow the viewport.
 */
export interface NgpFlipOptions {
  /**
   * The minimum padding between the floating element and the viewport edges.
   * Prevents the floating element from touching the edges of the viewport.
   * @default 0
   */
  padding?: number;

  /**
   * Placements to try sequentially if the preferred placement does not fit.
   * @default [oppositePlacement] (computed)
   */
  fallbackPlacements?: Placement[];
}

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
