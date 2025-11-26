import { HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
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
    const tagName = inject(HOST_TAG_NAME);
    const accordion = injectAccordionState<T>();
    const accordionItem = injectAccordionItemState<T>();

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'type', tagName === 'button' ? 'button' : null);
    attrBinding(element, 'aria-controls', accordionItem().contentId);
    attrBinding(element, 'aria-expanded', accordionItem().open);
    dataBinding(element, 'data-orientation', accordion().orientation);
    dataBinding(element, 'data-open', accordionItem().open);
    dataBinding(
      element,
      'data-disabled',
      () => accordionItem().disabled() || accordion().disabled(),
    );

    // register the trigger with the accordion item
    accordionItem().setTrigger(id());

    // Methods
    function toggle(): void {
      if (accordionItem().disabled() || accordion().disabled()) {
        return;
      }

      accordion().toggle(accordionItem().value()!);
    }

    // Event listeners
    listener(element, 'click', toggle);

    return { id, toggle };
  },
);
