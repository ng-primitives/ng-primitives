import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NgpAccordionContentState } from '../accordion-content/accordion-content-pattern';
import { NgpAccordionTriggerState } from '../accordion-trigger/accordion-trigger-pattern';
import { injectAccordionPattern } from '../accordion/accordion-pattern';

export interface NgpAccordionItemState<T> {
  value: Signal<T>;
  disabled: Signal<boolean>;
  trigger: Signal<NgpAccordionTriggerState | undefined>;
  content: Signal<NgpAccordionContentState | undefined>;
  open: Signal<boolean>;
  triggerId: Signal<string | undefined>;
  contentId: Signal<string | undefined>;
  setTrigger(trigger: NgpAccordionTriggerState): void;
  setContent(content: NgpAccordionContentState): void;
}

export interface NgpAccordionItemProps<T> {
  value: Signal<T>;
  disabled: Signal<boolean>;
  element?: ElementRef<HTMLElement>;
}

export function ngpAccordionItemPattern<T>({
  value,
  disabled,
  element = injectElementRef(),
}: NgpAccordionItemProps<T>): NgpAccordionItemState<T> {
  const accordion = injectAccordionPattern<T>();
  const trigger = signal<NgpAccordionTriggerState | undefined>(undefined);
  const content = signal<NgpAccordionContentState | undefined>(undefined);

  // Whether the accordion item is expanded.
  const open = computed<boolean>(() => accordion.isOpen(value()));

  const triggerId = computed(() => trigger()?.id());
  const contentId = computed(() => content()?.id());

  /**
   * Set the trigger for this accordion item
   */
  function setTrigger(triggerState: NgpAccordionTriggerState): void {
    trigger.set(triggerState);
  }

  /**
   * Set the content for this accordion item
   */
  function setContent(contentState: NgpAccordionContentState): void {
    content.set(contentState);
  }

  // Setup host data bindings
  dataBinding(element, 'data-orientation', accordion.orientation);
  dataBinding(element, 'data-open', open);
  dataBinding(element, 'data-disabled', () => disabled() || accordion.disabled());

  return {
    value,
    disabled,
    trigger: trigger.asReadonly(),
    content: content.asReadonly(),
    open,
    triggerId,
    contentId,
    setTrigger,
    setContent,
  };
}

export const NgpAccordionItemPatternToken = new InjectionToken<NgpAccordionItemState<unknown>>(
  'NgpAccordionItemPatternToken',
);

export function injectAccordionItemPattern<T>(): NgpAccordionItemState<T> {
  return inject(NgpAccordionItemPatternToken) as NgpAccordionItemState<T>;
}

export function provideAccordionItemPattern<T, V>(
  type: Type<T>,
  fn: (instance: T) => NgpAccordionItemState<V>,
): FactoryProvider {
  return { provide: NgpAccordionItemPatternToken, useFactory: () => fn(inject(type)) };
}
