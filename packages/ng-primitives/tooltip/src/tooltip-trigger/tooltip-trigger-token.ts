import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltipTrigger } from './tooltip-trigger';

export const NgpTooltipTriggerToken = new InjectionToken<NgpTooltipTrigger>(
  'NgpTooltipTriggerToken',
);

/**
 * Inject the TooltipTrigger directive instance
 */
export function injectTooltipTrigger(): NgpTooltipTrigger {
  return inject(NgpTooltipTriggerToken);
}

/**
 * Provides the TooltipTrigger directive instance
 * @param trigger
 */
export function provideTooltipTrigger(trigger: NgpTooltipTrigger) {
  return { provide: NgpTooltipTriggerToken, useValue: trigger };
}
