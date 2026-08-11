import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectToggleGroupState } from '../toggle-group/toggle-group-state';

/**
 * The state interface for the ToggleGroupItem pattern.
 */
export interface NgpToggleGroupItemState {
  selected: Signal<boolean>;
  toggle(): void;
}

/**
 * The props interface for the ToggleGroupItem pattern.
 */
export interface NgpToggleGroupItemProps<T = string> {
  /**
   * The value of the toggle group item.
   */
  value: Signal<T>;

  /**
   * Whether the toggle group item is disabled.
   */
  disabled?: Signal<boolean>;
}

export const [
  NgpToggleGroupItemToken,
  ngpToggleGroupItem,
  injectToggleGroupItemState,
  provideToggleGroupItemState,
] = createPrimitive(
  'NgpToggleGroupItem',
  <T = string>({
    value,
    disabled = signal(false),
  }: NgpToggleGroupItemProps<T>): NgpToggleGroupItemState => {
    const element = injectElementRef();
    const toggleGroup = injectToggleGroupState<T>();

    // Whether the item is selected.
    const selected = computed(() => toggleGroup()?.isSelected(value()!) ?? false);

    // Whether the item belongs to a multiple-select toggle group.
    const multiple = computed(() => toggleGroup()?.type() === 'multiple');

    // Host bindings
    // In a single-select group the items behave like radio buttons, while in a
    // multiple-select group they are independent toggle buttons exposing
    // aria-pressed, matching the standalone toggle primitive.
    attrBinding(element, 'role', () => (multiple() ? null : 'radio'));
    attrBinding(element, 'aria-checked', () => (multiple() ? null : selected()));
    attrBinding(element, 'aria-pressed', () => (multiple() ? selected() : null));
    dataBinding(element, 'data-selected', selected);
    attrBinding(element, 'aria-disabled', disabled);
    dataBinding(element, 'data-disabled', disabled);

    // Host listener
    listener(element, 'click', () => toggle());

    // Toggle the item.
    const toggle = (): void => {
      if (disabled?.()) {
        return;
      }
      toggleGroup()?.toggle(value()!);
    };

    return { selected, toggle } satisfies NgpToggleGroupItemState;
  },
);
