import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxSection } from './listbox-section';

export const NgpListboxSectionToken = new InjectionToken<NgpListboxSection>(
  'NgpListboxSectionToken',
);

/**
 * Inject the ListboxSection directive instance
 */
export function injectListboxSection(): NgpListboxSection {
  return inject(NgpListboxSectionToken);
}
