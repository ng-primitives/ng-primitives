import { computed, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, dataBinding, deprecatedSetter } from 'ng-primitives/state';
import { injectAccordionState } from '../accordion/accordion-state';

export interface NgpAccordionItemState<T> {
  /**
   * The value of the accordion item.
   */
  readonly value: Signal<T>;
  /**
   * Whether the accordion item is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Whether the accordion item is expanded.
   */
  readonly open: Signal<boolean>;
  /**
   * The trigger id.
   */
  readonly triggerId: Signal<string | undefined>;
  /**
   * The content id.
   */
  readonly contentId: Signal<string | undefined>;
  /**
   * Set the disabled state of the accordion item.
   */
  setDisabled(value: boolean): void;
  /**
   * Set the trigger of the accordion item.
   */
  setTrigger(id: string): void;
  /**
   * Set the content of the accordion item.
   */
  setContent(id: string): void;
}

export interface NgpAccordionItemProps<T> {
  /**
   * The value of the accordion item.
   */
  readonly value: Signal<T>;
  /**
   * Whether the accordion item is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpAccordionItemStateToken,
  ngpAccordionItem,
  _injectAccordionItemState,
  provideAccordionItemState,
] = createPrimitive(
  'NgpAccordionItem',
  <T>({ value, disabled: _disabled = signal(false) }: NgpAccordionItemProps<T>) => {
    const accordion = injectAccordionState<T>();
    const element = injectElementRef();

    const disabled = controlled(_disabled);

    // Whether the accordion item is expanded.
    const open = computed<boolean>(() => accordion().isOpen(value()));

    const trigger = signal<string | undefined>(undefined);
    const content = signal<string | undefined>(undefined);

    // Setup host data bindings
    dataBinding(element, 'data-orientation', accordion().orientation);
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-disabled', () => disabled() || accordion().disabled());

    // Set the disabled state of the accordion item.
    function setDisabled(value: boolean) {
      disabled.set(value);
    }

    function setTrigger(id: string) {
      trigger.set(id);
    }

    function setContent(id: string) {
      content.set(id);
    }

    return {
      value,
      open,
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      triggerId: deprecatedSetter(trigger, 'setTrigger'),
      contentId: deprecatedSetter(content, 'setContent'),
      setDisabled,
      setTrigger,
      setContent,
    } satisfies NgpAccordionItemState<T>;
  },
);

export function injectAccordionItemState<T>(): Signal<NgpAccordionItemState<T>> {
  return _injectAccordionItemState() as Signal<NgpAccordionItemState<T>>;
}
