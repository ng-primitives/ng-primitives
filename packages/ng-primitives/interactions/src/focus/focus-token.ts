import { InjectionToken, inject } from '@angular/core';
import type { NgpFocus } from './focus';

export const NgpFocusToken = new InjectionToken<NgpFocus>('NgpFocusToken');

/**
 * Inject the Focus directive instance
 */
export function injectFocus(): NgpFocus {
  return inject(NgpFocusToken);
}
