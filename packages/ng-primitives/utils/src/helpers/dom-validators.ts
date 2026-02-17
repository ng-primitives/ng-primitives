import { ElementRef } from '@angular/core';

/**
 * Checks if a value is a native button element.
 * Note: This only checks for `<button>` elements, not `<input type="button|submit|reset">`.
 * For button role detection (which includes input buttons), additional checks are needed.
 * @param elementRef - The element to check
 * @param options - The options for the button element
 * @param options.types - The types of the button element
 * @returns true if the element is a native button element, false otherwise
 */
export function isNativeButtonTag(
  elementRef: ElementRef,
  { types = [] }: { types?: string[] } = {},
): elementRef is ElementRef<HTMLButtonElement> {
  return (
    elementRef.nativeElement.tagName === 'BUTTON' &&
    (types.length === 0 || types.includes((elementRef.nativeElement as HTMLButtonElement).type))
  );
}

/**
 * Checks if a value is a native input element.
 * @param elementRef - The element to check
 * @param options - The options for the input element
 * @param options.types - The types of the input element
 * @returns true if the element is a native input element, false otherwise
 */
export function isNativeInputTag(
  elementRef: ElementRef,
  { types = [] }: { types?: string[] } = {},
): elementRef is ElementRef<HTMLInputElement> {
  return (
    elementRef.nativeElement.tagName === 'INPUT' &&
    (types.length === 0 || types.includes(elementRef.nativeElement.type))
  );
}

/**
 * Checks if a value is a native anchor element
 * @param elementRef - The element to check
 * @param options - The options for the anchor element
 * @param options.validLink - Whether to check if the element is a valid link (has href or routerLink attribute)
 * @returns true if the element is a native anchor element, false otherwise
 */
export function isNativeAnchorTag(
  elementRef: ElementRef,
  { validLink = false }: { validLink?: boolean } = {},
): elementRef is ElementRef<HTMLAnchorElement> {
  return (
    elementRef.nativeElement.tagName === 'A' &&
    (!validLink || !!elementRef.nativeElement.href || !!elementRef.nativeElement.routerLink)
  );
}

/**
 * Checks if an element supports the native `disabled` attribute.
 * @param elementRef - The element to check
 * @returns true if the element supports the disabled attribute, false otherwise
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
 */
export function supportsDisabledAttribute(
  elementRef: ElementRef,
): elementRef is ElementRef<HTMLElement & { disabled: boolean }> {
  return elementRef.nativeElement instanceof HTMLElement && 'disabled' in elementRef.nativeElement;
}
