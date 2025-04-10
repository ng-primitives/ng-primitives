import { InjectionToken, inject } from '@angular/core';
import type { NgpListboxTrigger } from './listbox-trigger';

export const NgpListboxTriggerToken = new InjectionToken<NgpListboxTrigger>(
  'NgpListboxTriggerToken',
);

/**
 * Inject the ListboxTrigger directive instance
 */
export function injectListboxTrigger(): NgpListboxTrigger {
  return inject(NgpListboxTriggerToken);
}
