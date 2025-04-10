import { InjectionToken, inject } from '@angular/core';
import type { NgpTextarea } from './textarea';

export const NgpTextareaToken = new InjectionToken<NgpTextarea>('NgpTextareaToken');

/**
 * Inject the Textarea directive instance
 */
export function injectTextarea(): NgpTextarea {
  return inject(NgpTextareaToken);
}
