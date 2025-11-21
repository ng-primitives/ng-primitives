import { computed, signal, Signal } from '@angular/core';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectElementRef } from 'ng-primitives/internal';
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
export interface NgpToggleGroupItemProps {
  /**
   * The value of the toggle group item.
   */
  value: Signal<string>;

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
  ({ value, disabled = signal(false) }: NgpToggleGroupItemProps): NgpToggleGroupItemState => {
    const element = injectElementRef();
    const toggleGroup = injectToggleGroupState();

    // Whether the item is selected.
    const selected = computed(() => toggleGroup()?.isSelected(value()!) ?? false);

    // Host bindings
    attrBinding(element, 'role', 'radio');
    attrBinding(element, 'aria-checked', selected);
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

    return { selected, toggle };
  },
);
