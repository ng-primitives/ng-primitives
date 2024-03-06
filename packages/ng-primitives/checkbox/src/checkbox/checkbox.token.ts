import { InjectionToken, inject } from '@angular/core';
import type { NgpCheckboxDirective } from './checkbox.directive';

export const NgpCheckboxToken = new InjectionToken<NgpCheckboxDirective>('NgpCheckboxToken');

/**
 * Inject the Checkbox directive instance
 * @returns The Checkbox directive instance
 */
export function injectCheckbox(): NgpCheckboxDirective {
  return inject(NgpCheckboxToken);
}
