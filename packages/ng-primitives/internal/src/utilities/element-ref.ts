import { ElementRef, inject } from '@angular/core';

/**
 * A simple utility function to inject an element reference with less boilerplate.
 * @returns The element reference.
 */
export function injectElementRef<T extends HTMLElement>(): ElementRef<T> {
  return inject(ElementRef);
}
