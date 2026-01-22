/**
 * Type validation utilities
 */
import { coerceElement } from '@angular/cdk/coercion';
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
 * Checks if a value is a native button element.
 * Note: This only checks for `<button>` elements, not `<input type="button|submit|reset">`.
 * For button role detection (which includes input buttons), additional checks are needed.
 * @param element - The element to check
 * @param types - The types of the button element
 * @returns true if the element is a native button element, false otherwise
 */
export function isNativeButtonTag(
  element: Element,
  ...types: string[]
): element is HTMLButtonElement;
export function isNativeButtonTag(
  element: ElementRef,
  ...types: string[]
): element is ElementRef<HTMLButtonElement>;
export function isNativeButtonTag(element: Element | ElementRef, ...types: string[]): boolean {
  const el = coerceElement(element);
  return (
    el?.tagName === 'BUTTON' &&
    (types.length > 0 ? types.includes((el as HTMLButtonElement).type) : true)
  );
}

/**
 * Checks if a value is a native input element.
 * @param element - The element to check
 * @param types - The types of the input element
 * @returns true if the element is a native input element, false otherwise
 */
export function isNativeInputTag(element: Element, ...types: string[]): element is HTMLInputElement;
export function isNativeInputTag(
  element: ElementRef,
  ...types: string[]
): element is ElementRef<HTMLInputElement>;
export function isNativeInputTag(element: Element | ElementRef, ...types: string[]): boolean {
  const el = coerceElement(element);
  return (
    el?.tagName === 'INPUT' &&
    (types.length > 0 ? types.includes((el as HTMLInputElement).type) : true)
  );
}

/**
 * Checks if a value is a native anchor element
 * @param element - The element to check
 * @param validLinkOnly - Whether to check if the element has a valid link (href)
 * @returns true if the element is a native anchor element, false otherwise
 */
export function isNativeAnchorTag(
  element: Element,
  validLinkOnly?: boolean,
): element is HTMLAnchorElement;
export function isNativeAnchorTag(
  element: ElementRef,
  validLinkOnly?: boolean,
): element is ElementRef<HTMLAnchorElement>;
export function isNativeAnchorTag(element: Element | ElementRef, validLinkOnly?: boolean): boolean {
  const el = coerceElement(element);
  return el?.tagName === 'A' && (validLinkOnly ? !!el.href : true);
}

/**
 * Checks if an element supports the native `disabled` attribute.
 * @param element - The element to check
 * @returns true if the element supports the disabled attribute, false otherwise
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
 */
export function supportsNativeDisable(
  element: Element,
): element is HTMLElement & { disabled: boolean };
export function supportsNativeDisable(
  element: ElementRef,
): element is ElementRef<HTMLElement & { disabled: boolean }>;
export function supportsNativeDisable(element: Element | ElementRef): boolean {
  const el = coerceElement(element);
  return el instanceof HTMLElement && 'disabled' in el;
}
