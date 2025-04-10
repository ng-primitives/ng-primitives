import { InjectionToken, inject } from '@angular/core';
import type { NgpVisuallyHidden } from './visually-hidden';

export const NgpVisuallyHiddenToken = new InjectionToken<NgpVisuallyHidden>(
  'NgpVisuallyHiddenToken',
);

/**
 * Inject the VisuallyHidden directive instance
 */
export function injectVisuallyHidden(): NgpVisuallyHidden {
  return inject(NgpVisuallyHiddenToken);
}
