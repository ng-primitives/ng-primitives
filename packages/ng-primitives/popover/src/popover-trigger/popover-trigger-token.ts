import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpPopoverTrigger } from './popover-trigger';

export const NgpPopoverTriggerToken = new InjectionToken<NgpPopoverTrigger>(
  'NgpPopoverTriggerToken',
);

/**
 * Inject the PopoverTrigger directive instance
 */
export function injectPopoverTrigger(): NgpPopoverTrigger {
  return inject(NgpPopoverTriggerToken);
}

/**
 * Provides the PopoverTrigger directive instance
 * @param trigger
 */
export function providePopoverTrigger(trigger: Type<NgpPopoverTrigger>): ExistingProvider {
  return { provide: NgpPopoverTriggerToken, useExisting: trigger };
}
