import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives-state/state';
import type { NgpAccordion } from './accordion';

/**
 * The state token  for the Accordion primitive.
 */
export const NgpAccordionStateToken = createStateToken<NgpAccordion<unknown>>('Accordion');

/**
 * Provides the Accordion state.
 */
export const provideAccordionState = createStateProvider(NgpAccordionStateToken);

/**
 * Injects the Accordion state.
 */
export const injectAccordionState = createStateInjector(NgpAccordionStateToken);

/**
 * The Accordion state registration function.
 */
export const accordionState = createState(NgpAccordionStateToken);
