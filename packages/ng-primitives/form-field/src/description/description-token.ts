import { InjectionToken, inject } from '@angular/core';
import type { NgpDescription } from './description';

export const NgpDescriptionToken = new InjectionToken<NgpDescription>('NgpDescriptionToken');

/**
 * Inject the Description directive instance
 */
export function injectDescription(): NgpDescription {
  return inject(NgpDescriptionToken);
}
