import { InjectionToken, inject } from '@angular/core';
import type { NgpFormField } from './form-field';

export const NgpFormFieldToken = new InjectionToken<NgpFormField>('NgpFormFieldToken');

/**
 * Inject the FormField directive instance
 * @param primitive
 */
export function injectFormField(): NgpFormField | null {
  return inject(NgpFormFieldToken, { optional: true });
}
