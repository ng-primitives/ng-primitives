import { InjectionToken, inject } from '@angular/core';
import type { NgpLabel } from './label';

export const NgpLabelToken = new InjectionToken<NgpLabel>('NgpLabelToken');

/**
 * Inject the Label directive instance
 */
export function injectLabel(): NgpLabel {
  return inject(NgpLabelToken);
}
