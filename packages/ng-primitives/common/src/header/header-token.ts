import { InjectionToken, inject } from '@angular/core';
import type { NgpHeader } from './header';

/**
 * @deprecated
 */
export const NgpHeaderToken = new InjectionToken<NgpHeader>('NgpHeaderToken');

/**
 * Inject the Header directive instance
 */
export function injectHeader(): NgpHeader {
  return inject(NgpHeaderToken);
}
