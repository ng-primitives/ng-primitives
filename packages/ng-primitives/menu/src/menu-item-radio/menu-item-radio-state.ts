import { computed, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectMenuItemRadioGroupState } from '../menu-item-radio-group/menu-item-radio-group-state';
import { ngpMenuItem } from '../menu-item/menu-item-state';

export interface NgpMenuItemRadioState {
  /**
   * Whether the radio item is checked.
   */
  readonly checked: Signal<boolean>;
}

export interface NgpMenuItemRadioProps {
  /**
   * The value this radio item represents.
   */
  readonly value: Signal<string>;

  /**
   * Whether the radio item is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether choosing the item closes the menu. `undefined` closes it on a click or Enter and keeps
   * it open on Space.
   */
  readonly closeOnSelect?: Signal<boolean | undefined>;
}

export const [
  NgpMenuItemRadioStateToken,
  ngpMenuItemRadio,
  injectMenuItemRadioState,
  provideMenuItemRadioState,
] = createPrimitive(
  'NgpMenuItemRadio',
  ({
    value,
    disabled = signal(false),
    closeOnSelect = signal(undefined),
  }: NgpMenuItemRadioProps): NgpMenuItemRadioState => {
    const element = injectElementRef();
    const radioGroup = injectMenuItemRadioGroupState();

    ngpMenuItem({ disabled, closeOnSelect, role: 'menuitemradio' });

    // Computed checked state
    const checked = computed(() => radioGroup()?.value() === value());

    // Host bindings
    attrBinding(element, 'aria-checked', checked);
    dataBinding(element, 'data-checked', checked);

    // Select on click
    listener(element, 'click', () => {
      if (disabled()) {
        return;
      }
      radioGroup()?.select(value());
    });

    return {
      checked,
    } satisfies NgpMenuItemRadioState;
  },
);
