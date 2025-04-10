import { InjectionToken, inject } from '@angular/core';
import type { NgpToast } from './toast';

export const NgpToastToken = new InjectionToken<NgpToast>('NgpToastToken');

/**
 * Inject the Toast directive instance
 */
export function injectToast(): NgpToast {
  return inject(NgpToastToken);
}
