import { InjectionToken, inject } from '@angular/core';
import type { NgpRovingFocusItem } from './roving-focus-item';

export const NgpRovingFocusItemToken = new InjectionToken<NgpRovingFocusItem>(
  'NgpRovingFocusItemToken',
);

/**
 * Inject the RovingFocusItem directive instance
 * @returns The RovingFocusItem directive instance
 */
export function injectRovingFocusItem(): NgpRovingFocusItem {
  return inject(NgpRovingFocusItemToken);
}
