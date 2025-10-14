import { ElementRef, FactoryProvider, inject, InjectionToken, Signal, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, listener } from 'ng-primitives/state';
import { injectAccordionItemPattern } from '../accordion-item/accordion-item-pattern';
import { injectAccordionPattern } from '../accordion/accordion-pattern';

export interface NgpAccordionTriggerState {
  id: Signal<string>;
  toggle(): void;
}

export interface NgpAccordionTriggerProps {
  id: Signal<string>;
  element?: ElementRef<HTMLElement>;
}

export function ngpAccordionTriggerPattern<T>({
  id,
  element = injectElementRef(),
}: NgpAccordionTriggerProps): NgpAccordionTriggerState {
  const tagName = element.nativeElement.tagName.toLowerCase();
  const accordion = injectAccordionPattern<T>();
  const accordionItem = injectAccordionItemPattern<T>();

  // Setup host attribute bindings
  attrBinding(element, 'id', id);
  attrBinding(element, 'type', () => (tagName === 'button' ? 'button' : null));
  dataBinding(element, 'data-orientation', accordion.orientation);
  dataBinding(element, 'data-open', accordionItem.open);
  dataBinding(element, 'data-disabled', () =>
    accordionItem.disabled() || accordion.disabled() ? '' : null,
  );
  attrBinding(element, 'aria-controls', () => accordionItem.contentId() || null);
  attrBinding(element, 'aria-expanded', () => (accordionItem.open() ? 'true' : 'false'));
  listener(element, 'click', toggle);

  const state: NgpAccordionTriggerState = { id, toggle };

  accordionItem.setTrigger(state);

  /**
   * Toggle the accordion item.
   */
  function toggle(): void {
    if (accordionItem.disabled() || accordion.disabled()) {
      return;
    }

    accordion.toggle(accordionItem.value()!);
  }

  return state;
}

export const NgpAccordionTriggerPatternToken = new InjectionToken<NgpAccordionTriggerState>(
  'NgpAccordionTriggerPatternToken',
);

export function injectAccordionTriggerPattern(): NgpAccordionTriggerState {
  return inject(NgpAccordionTriggerPatternToken);
}

export function provideAccordionTriggerPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAccordionTriggerState,
): FactoryProvider {
  return { provide: NgpAccordionTriggerPatternToken, useFactory: () => fn(inject(type)) };
}
