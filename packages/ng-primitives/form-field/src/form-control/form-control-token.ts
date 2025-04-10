import { InjectionToken, inject } from '@angular/core';
import type { NgpFormControl } from './form-control';

export const NgpFormControlToken = new InjectionToken<NgpFormControl>('NgpFormControlToken');

/**
 * Inject the FormControl directive instance
 */
export function injectFormControl(): NgpFormControl {
  return inject(NgpFormControlToken);
}
