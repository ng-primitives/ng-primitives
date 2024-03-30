import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionDirective } from './accordion.directive';

export const NgpAccordionToken = new InjectionToken<NgpAccordionDirective<unknown>>(
  'NgpAccordionToken',
);

/**
 * Inject the Accordion directive instance
 * @returns The Accordion directive instance
 */
export function injectAccordion<T>(): NgpAccordionDirective<T> {
  return inject(NgpAccordionToken) as NgpAccordionDirective<T>;
}
