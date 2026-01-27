import { computed, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
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
  <T>({ id = signal(uniqueId('ngp-accordion-trigger')) }: NgpAccordionTriggerProps) => {
    const element = injectElementRef();
    const accordion = injectAccordionState<T>();
    const accordionItem = injectAccordionItemState<T>();

    ngpButton({
      disabled: computed(() => accordionItem().disabled() || accordion().disabled()),
      type: 'button',
    });

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-controls', accordionItem().contentId);
    attrBinding(element, 'aria-expanded', accordionItem().open);
    dataBinding(element, 'data-orientation', accordion().orientation);
    dataBinding(element, 'data-open', accordionItem().open);

    // register the trigger with the accordion item
    accordionItem().setTrigger(id());

    // Event listeners
    listener(element, 'click', () => accordion().toggle(accordionItem().value()!));

    return { id, toggle: () => element.nativeElement.click() } satisfies NgpAccordionTriggerState;
  },
);
