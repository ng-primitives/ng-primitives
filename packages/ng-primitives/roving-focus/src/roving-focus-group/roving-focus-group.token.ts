import { InjectionToken, inject } from '@angular/core';
import type { NgpRovingFocusGroupDirective } from './roving-focus-group.directive';

export const NgpRovingFocusGroupToken = new InjectionToken<NgpRovingFocusGroupDirective>(
  'NgpRovingFocusGroupToken',
);

/**
 * Inject the RovingFocusGroup directive instance
 * @returns The RovingFocusGroup directive instance
 */
export function injectRovingFocusGroup(): NgpRovingFocusGroupDirective {
  return inject(NgpRovingFocusGroupToken);
}
