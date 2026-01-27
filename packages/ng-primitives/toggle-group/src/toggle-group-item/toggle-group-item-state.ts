import { computed, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
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

    ngpButton({ disabled, role: 'radio', type: 'button' });

    // Host bindings
    attrBinding(element, 'aria-checked', selected);
    dataBinding(element, 'data-selected', selected);

    // Host listener
    listener(element, 'click', () => toggleGroup()?.toggle(value()!));

    return {
      selected,
      toggle: () => element.nativeElement.click(),
    } satisfies NgpToggleGroupItemState;
  },
);
