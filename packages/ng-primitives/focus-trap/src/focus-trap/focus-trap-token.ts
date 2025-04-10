import { InjectionToken, inject } from '@angular/core';
import type { NgpFocusTrap } from './focus-trap';

export const NgpFocusTrapToken = new InjectionToken<NgpFocusTrap>('NgpFocusTrapToken');

/**
 * Inject the FocusTrap directive instance
 */
export function injectFocusTrap(): NgpFocusTrap {
  return inject(NgpFocusTrapToken);
}
