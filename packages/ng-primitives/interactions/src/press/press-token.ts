import { InjectionToken, inject } from '@angular/core';
import type { NgpPress } from './press';

export const NgpPressToken = new InjectionToken<NgpPress>('NgpPressToken');

/**
 * Inject the Press directive instance
 */
export function injectPress(): NgpPress {
  return inject(NgpPressToken);
}
