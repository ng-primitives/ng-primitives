import { InjectionToken, inject } from '@angular/core';
import type { NgpHover } from './hover';

export const NgpHoverToken = new InjectionToken<NgpHover>('NgpHoverToken');

/**
 * Inject the Hover directive instance
 * @returns Hover directive instance
 */
export function injectHover(): NgpHover {
  return inject(NgpHoverToken);
}
