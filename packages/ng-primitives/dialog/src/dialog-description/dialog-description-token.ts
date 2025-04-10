import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogDescription } from './dialog-description';

export const NgpDialogDescriptionToken = new InjectionToken<NgpDialogDescription>(
  'NgpDialogDescriptionToken',
);

/**
 * Inject the DialogDescription directive instance
 */
export function injectDialogDescription(): NgpDialogDescription {
  return inject(NgpDialogDescriptionToken);
}
