/**
 * Type validation utilities
 */

/**
 * Checks if a value is a string
 * @param value - The value to check
 * @returns true if the value is a string, false otherwise
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number
 * @param value - The value to check
 * @returns true if the value is a number, false otherwise
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/**
 * Checks if a value is a boolean
 * @param value - The value to check
 * @returns true if the value is a boolean, false otherwise
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is a function
 * @param value - The value to check
 * @returns true if the value is a function, false otherwise
 */
export function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}

/**
 * Checks if a value is a plain object (but not null or array)
 * @param value - The value to check
 * @returns true if the value is a plain object, false otherwise
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if a value is undefined
 * @param value - The value to check
 * @returns true if the value is undefined, false otherwise
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}
