import { InjectionToken, inject } from '@angular/core';
import type { NgpFocusVisible } from './focus-visible';

export const NgpFocusVisibleToken = new InjectionToken<NgpFocusVisible>('NgpFocusVisibleToken');

/**
 * Inject the FocusVisible directive instance
 */
export function injectFocusVisible(): NgpFocusVisible {
  return inject(NgpFocusVisibleToken);
}
