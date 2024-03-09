import { InjectionToken, inject } from '@angular/core';
import type { NgpSwitchDirective } from './switch.directive';

export const NgpSwitchToken = new InjectionToken<NgpSwitchDirective>('NgpSwitchToken');

/**
 * Inject the Switch directive instance
 * @returns The switch directive instance
 */
export function injectSwitch(): NgpSwitchDirective {
  return inject(NgpSwitchToken);
}
