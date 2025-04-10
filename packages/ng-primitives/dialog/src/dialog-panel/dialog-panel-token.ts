import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogPanel } from './dialog-panel';

export const NgpDialogPanelToken = new InjectionToken<NgpDialogPanel>('NgpDialogPanelToken');

/**
 * Inject the DialogPanel directive instance
 */
export function injectDialogPanel(): NgpDialogPanel {
  return inject(NgpDialogPanelToken);
}
