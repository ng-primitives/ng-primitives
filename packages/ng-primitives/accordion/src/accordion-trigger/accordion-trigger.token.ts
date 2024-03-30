import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionTriggerDirective } from './accordion-trigger.directive';

export const NgpAccordionTriggerToken = new InjectionToken<NgpAccordionTriggerDirective>(
  'NgpAccordionTriggerToken',
);

/**
 * Inject the AccordionTrigger directive instance
 */
export function injectAccordionTrigger(): NgpAccordionTriggerDirective {
  return inject(NgpAccordionTriggerToken);
}
