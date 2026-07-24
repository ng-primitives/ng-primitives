import { coerceBooleanOrUndefined, coerceNumberOrUndefined } from 'ng-primitives/utils';
import { describe, expect, it } from 'vitest';

describe('coerceNumberOrUndefined', () => {
  it('should preserve undefined instead of coercing to NaN', () => {
    expect(coerceNumberOrUndefined(undefined)).toBeUndefined();
  });

  it('should coerce numeric strings and numbers', () => {
    expect(coerceNumberOrUndefined('42')).toBe(42);
    expect(coerceNumberOrUndefined(42)).toBe(42);
    expect(coerceNumberOrUndefined(0)).toBe(0);
  });

  it('should coerce non-numeric values to NaN (matching numberAttribute)', () => {
    expect(coerceNumberOrUndefined(null)).toBeNaN();
    expect(coerceNumberOrUndefined('abc')).toBeNaN();
  });
});

describe('coerceBooleanOrUndefined', () => {
  it('should preserve undefined instead of coercing to false', () => {
    expect(coerceBooleanOrUndefined(undefined)).toBeUndefined();
  });

  it('should coerce any present value except the string "false" to true (matching booleanAttribute)', () => {
    expect(coerceBooleanOrUndefined(true)).toBe(true);
    // an empty string is the attribute-present form and coerces to true
    expect(coerceBooleanOrUndefined('')).toBe(true);
    expect(coerceBooleanOrUndefined('anything')).toBe(true);
  });

  it('should coerce false, null, and the string "false" to false (matching booleanAttribute)', () => {
    expect(coerceBooleanOrUndefined(false)).toBe(false);
    expect(coerceBooleanOrUndefined(null)).toBe(false);
    // the literal string "false" coerces to false even though it is JS-truthy
    expect(coerceBooleanOrUndefined('false')).toBe(false);
  });
});
