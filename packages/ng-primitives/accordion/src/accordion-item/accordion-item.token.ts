import { InjectionToken, inject } from '@angular/core';
import type { NgpAccordionItemDirective } from './accordion-item.directive';

export const NgpAccordionItemToken = new InjectionToken<NgpAccordionItemDirective<unknown>>(
  'NgpAccordionItemToken',
);

/**
 * Inject the AccordionItem directive instance
 * @returns The AccordionItem directive instance
 */
export function injectAccordionItem<T>(): NgpAccordionItemDirective<T> {
  return inject(NgpAccordionItemToken) as NgpAccordionItemDirective<T>;
}
