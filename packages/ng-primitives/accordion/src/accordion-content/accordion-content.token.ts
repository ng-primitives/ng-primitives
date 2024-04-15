import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionContentDirective } from './accordion-content.directive';

export const NgpAccordionContentToken = new InjectionToken<NgpAccordionContentDirective>(
  'NgpAccordionContentToken',
);

/**
 * Inject the AccordionContent directive instance
 * @returns The AccordionContent directive instance
 */
export function injectAccordionContent(): NgpAccordionContentDirective {
  return inject(NgpAccordionContentToken);
}
