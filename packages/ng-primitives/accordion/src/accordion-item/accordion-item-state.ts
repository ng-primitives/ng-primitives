import { computed, Signal, signal } from '@angular/core';
import { ngpCollapsible } from 'ng-primitives/collapsible';
import {
  controlled,
  createPrimitive,
  deprecatedSetter,
  StateInjectionOptions,
} from 'ng-primitives/state';
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

    // Item-level disabled (public); the effective disabled also factors in the group.
    const disabled = controlled(_disabled);

    // Compose the shared collapsible core. `open` is derived from the group, so it
    // is controlled - toggles route through onOpenChange -> accordion.toggle and the
    // group stays authoritative (it may reject a toggle in single, non-collapsible
    // mode). The core owns the item's data-orientation/open/closed/disabled bindings
    // and the trigger/content id registration.
    const collapsible = ngpCollapsible({
      open: computed(() => accordion().isOpen(value())),
      disabled: computed(() => disabled() || accordion().disabled()),
      orientation: accordion().orientation,
      onOpenChange: () => accordion().toggle(value() as T),
    });

    // Set the disabled state of the accordion item.
    function setDisabled(value: boolean) {
      disabled.set(value);
    }

    function setTrigger(id: string) {
      collapsible.setTrigger(id);
    }

    function setContent(id: string) {
      collapsible.setContent(id);
    }

    return {
      value,
      open: collapsible.open,
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      triggerId: collapsible.triggerId,
      contentId: collapsible.contentId,
      setDisabled,
      setTrigger,
      setContent,
    } satisfies NgpAccordionItemState<T>;
  },
);

export function injectAccordionItemState<T>(
  options?: StateInjectionOptions,
): Signal<NgpAccordionItemState<T>> {
  return _injectAccordionItemState(options) as Signal<NgpAccordionItemState<T>>;
}
