import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpToggleGroupItem } from './toggle-group-item';

export const NgpToggleGroupItemToken = new InjectionToken<NgpToggleGroupItem>(
  'NgpToggleGroupItemToken',
);

/**
 * Inject the ToggleGroupItem directive instance
 */
export function injectToggleGroupItem(): NgpToggleGroupItem {
  return inject(NgpToggleGroupItemToken);
}

/**
 * Provide the ToggleGroupItem directive instance
 */
export function provideToggleGroupItem(type: Type<NgpToggleGroupItem>): ExistingProvider {
  return { provide: NgpToggleGroupItemToken, useExisting: type };
}
