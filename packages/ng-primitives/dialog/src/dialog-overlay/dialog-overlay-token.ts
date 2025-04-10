import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogOverlay } from './dialog-overlay';

export const NgpDialogOverlayToken = new InjectionToken<NgpDialogOverlay>('NgpDialogOverlayToken');

/**
 * Inject the DialogOverlay directive instance
 */
export function injectDialogOverlay(): NgpDialogOverlay {
  return inject(NgpDialogOverlayToken);
}
