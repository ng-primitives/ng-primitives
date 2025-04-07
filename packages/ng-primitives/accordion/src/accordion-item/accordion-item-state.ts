import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpAccordionItem } from './accordion-item';

/**
 * The state token  for the AccordionItem primitive.
 */
export const NgpAccordionItemStateToken =
  createStateToken<NgpAccordionItem<unknown>>('AccordionItem');

/**
 * Provides the AccordionItem state.
 */
export const provideAccordionItemState = createStateProvider(NgpAccordionItemStateToken);

/**
 * Injects the AccordionItem state.
 */
export const injectAccordionItemState = createStateInjector(NgpAccordionItemStateToken);

/**
 * The AccordionItem state registration function.
 */
export const accordionItemState = createState(NgpAccordionItemStateToken);
