import { InjectionToken, inject } from '@angular/core';
import type { NgpSeparator } from './separator';

export const NgpSeparatorToken = new InjectionToken<NgpSeparator>('NgpSeparatorToken');

/**
 * Inject the Separator directive instance
 */
export function injectSeparator(): NgpSeparator {
  return inject(NgpSeparatorToken);
}
