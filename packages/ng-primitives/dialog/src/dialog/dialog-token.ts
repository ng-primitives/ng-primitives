import { InjectionToken, inject } from '@angular/core';
import type { NgpDialog } from './dialog';

export const NgpDialogToken = new InjectionToken<NgpDialog>('NgpDialogToken');

/**
 * Inject the Dialog directive instance
 */
export function injectDialog(): NgpDialog {
  return inject(NgpDialogToken);
}
