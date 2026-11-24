import { computed, signal, Signal } from '@angular/core';
import { ngpCollapsibleTrigger } from 'ng-primitives/collapsible';
import { createPrimitive } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import { injectAccordionState } from '../accordion/accordion-state';

export interface NgpAccordionTriggerState {
  /**
   * The id of the trigger button
   */
  readonly id: Signal<string>;
  /**
   * Toggle the accordion item.
   */
  toggle(): void;
}

export interface NgpAccordionTriggerProps {
  /**
   * The id of the trigger button
   */
  readonly id?: Signal<string>;
}

export const [
  NgpAccordionTriggerStateToken,
  ngpAccordionTrigger,
  injectAccordionTriggerState,
  provideAccordionTriggerState,
] = createPrimitive(
  'NgpAccordionTrigger',
  ({ id = signal(uniqueId('ngp-accordion-trigger')) }: NgpAccordionTriggerProps) => {
    const accordion = injectAccordionState();
    const item = injectAccordionItemState();

    // The accordion trigger is the shared collapsible trigger - it wires the
    // button semantics (type, aria-expanded, aria-controls, aria-disabled),
    // registers its id with the item's collapsible state, and toggles on click.
    const trigger = ngpCollapsibleTrigger({
      id,
      ariaDisabled: computed(() => accordion().isLocked(item().value())),
    });

    return { id: trigger.id, toggle: trigger.toggle } satisfies NgpAccordionTriggerState;
  },
);
