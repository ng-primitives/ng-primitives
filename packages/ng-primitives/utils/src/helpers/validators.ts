/**
 * Type validation utilities
 */
import { ElementRef } from '@angular/core';

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

/**
 * Checks if a value is null or undefined
 * @param value - The value to check
 * @returns true if the value is null or undefined, false otherwise
 */
export function isNil(value: unknown): value is null | undefined {
  return isUndefined(value) || value === null;
}

/**
 * Checks if a value is not null and not undefined
 * @param value - The value to check
 * @returns true if the value is not null and not undefined, false otherwise
 */
export function notNil<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}

/**
 * Checks if a value is a native button element
 * @param element - The element to check
 * @returns true if the element is a native button element, false otherwise
 */
export function isNativeButton(
  element: ElementRef<HTMLElement>,
): element is ElementRef<HTMLButtonElement> {
  return element.nativeElement.tagName === 'BUTTON';
}

/**
 * Checks if a value is a native anchor element
 * @param element - The element ref to check
 * @returns true if the element is a native anchor element, false otherwise
 */
export function isNativeAnchor(
  element: ElementRef<HTMLElement>,
): element is ElementRef<HTMLAnchorElement> {
  return element.nativeElement.tagName === 'A';
}

/**
 * Checks if a value is a valid link
 * @param element - The element ref to check
 * @returns true if the element is a valid link, false otherwise
 */
export function isValidLink(
  element: ElementRef<HTMLElement>,
): element is ElementRef<HTMLAnchorElement> {
  return Boolean(isNativeAnchor(element) && element.nativeElement.href);
}
