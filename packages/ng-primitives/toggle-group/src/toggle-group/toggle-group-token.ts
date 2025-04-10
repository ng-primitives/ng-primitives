import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpToggleGroup } from './toggle-group';

export const NgpToggleGroupToken = new InjectionToken<NgpToggleGroup>('NgpToggleGroupToken');

/**
 * Inject the ToggleGroup directive instance
 */
export function injectToggleGroup(): NgpToggleGroup {
  return inject(NgpToggleGroupToken);
}

/**
 * Provide the ToggleGroup directive instance
 */
export function provideToggleGroup(type: Type<NgpToggleGroup>): ExistingProvider {
  return { provide: NgpToggleGroupToken, useExisting: type };
}
