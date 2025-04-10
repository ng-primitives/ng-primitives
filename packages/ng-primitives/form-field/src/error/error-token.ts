import { InjectionToken, inject } from '@angular/core';
import type { NgpError } from './error';

export const NgpErrorToken = new InjectionToken<NgpError>('NgpErrorToken');

/**
 * Inject the Error directive instance
 */
export function injectError(): NgpError {
  return inject(NgpErrorToken);
}
