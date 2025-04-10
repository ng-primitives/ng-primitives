import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpSwitch } from './switch';

export const NgpSwitchToken = new InjectionToken<NgpSwitch>('NgpSwitchToken');

/**
 * Inject the Switch directive instance
 */
export function injectSwitch(): NgpSwitch {
  return inject(NgpSwitchToken);
}

/**
 * Provide the Switch directive instance
 */
export function provideSwitch(type: Type<NgpSwitch>): ExistingProvider {
  return { provide: NgpSwitchToken, useExisting: type };
}
