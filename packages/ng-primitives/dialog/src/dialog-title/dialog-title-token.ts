import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogTitle } from './dialog-title';

export const NgpDialogTitleToken = new InjectionToken<NgpDialogTitle>('NgpDialogTitleToken');

/**
 * Inject the DialogTitle directive instance
 */
export function injectDialogTitle(): NgpDialogTitle {
  return inject(NgpDialogTitleToken);
}
