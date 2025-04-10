import { InjectionToken, inject } from '@angular/core';
import type { NgpMove } from './move';

export const NgpMoveToken = new InjectionToken<NgpMove>('NgpMoveToken');

/**
 * Inject the Move directive instance
 */
export function injectMove(): NgpMove {
  return inject(NgpMoveToken);
}
