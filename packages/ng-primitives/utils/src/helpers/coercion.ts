import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, numberAttribute } from '@angular/core';

/**
 * A number input `transform` for a two-way value that may be uncontrolled.
 *
 * `numberAttribute` coerces `undefined` to `NaN`, which `controlledState` reads
 * as a defined (controlled) value and latches the primitive into controlled
 * mode with a bogus number. This preserves `undefined` so an absent binding
 * stays uncontrolled, while coercing every other value as usual.
 */
export function coerceNumberOrUndefined(value: NumberInput): number | undefined {
  return value === undefined ? undefined : numberAttribute(value);
}

/**
 * A boolean input `transform` for a two-way value that may be uncontrolled.
 *
 * `booleanAttribute` coerces `undefined` to `false`, which `controlledState`
 * reads as a defined (controlled) value and latches the primitive into
 * controlled mode. This preserves `undefined` so an absent binding stays
 * uncontrolled, while coercing every other value as usual.
 */
export function coerceBooleanOrUndefined(value: BooleanInput): boolean | undefined {
  return value === undefined ? undefined : booleanAttribute(value);
}
