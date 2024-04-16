import { InjectionToken, inject } from '@angular/core';
import type { NgpCollapsibleTriggerDirective } from './collapsible-trigger.directive';

export const NgpCollapsibleTriggerToken = new InjectionToken<NgpCollapsibleTriggerDirective>(
  'NgpCollapsibleTriggerToken',
);

/**
 * Inject the CollapsibleTrigger directive instance
 * @returns The CollapsibleTrigger directive instance
 */
export function injectCollapsibleTrigger(): NgpCollapsibleTriggerDirective {
  return inject(NgpCollapsibleTriggerToken);
}
