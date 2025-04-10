import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxOption } from './listbox-option';

export const NgpListboxOptionToken = new InjectionToken<NgpListboxOption<unknown>>(
  'NgpListboxOptionToken',
);

/**
 * Inject the ListboxOption directive instance
 */
export function injectListboxOption<T>(): NgpListboxOption<T> {
  return inject(NgpListboxOptionToken) as NgpListboxOption<T>;
}
