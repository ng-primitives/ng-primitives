import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, numberAttribute } from '@angular/core';

/**
 * Transform a number input to a valid tabindex attribute value.
 * @param value The number input value.
 * @returns The tabindex attribute value.
 */
export function tabIndexAttribute(value: NumberInput): number | null {
  if (value == null) {
    return null;
  }

  const parsed = numberAttribute(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Transform a boolean input to a valid aria-disabled attribute value.
 * @param value The boolean input value.
 * @returns The aria-disabled attribute value.
 */
export function ariaDisabledAttribute(value: BooleanInput): boolean | null {
  return value == null ? null : booleanAttribute(value);
}
