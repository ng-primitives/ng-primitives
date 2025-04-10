import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpMenu } from './menu';

export const NgpMenuToken = new InjectionToken<NgpMenu>('NgpMenuToken');

/**
 * Inject the Menu directive instance
 */
export function injectMenu(): NgpMenu {
  return inject(NgpMenuToken);
}

/**
 * Provide the Menu directive instance
 */
export function provideMenu(type: Type<NgpMenu>): ExistingProvider {
  return { provide: NgpMenuToken, useExisting: type };
}
