import { InjectionToken, inject } from '@angular/core';
import type { NgpListbox } from './listbox';

export const NgpListboxToken = new InjectionToken<NgpListbox<unknown>>('NgpListboxToken');

/**
 * Inject the Listbox directive instance
 */
export function injectListbox<T>(): NgpListbox<T> {
  return inject(NgpListboxToken) as NgpListbox<T>;
}
