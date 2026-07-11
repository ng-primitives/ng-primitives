import { computed, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusItem } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  styleBinding,
} from 'ng-primitives/state';
import { injectColorSwatchPickerState } from '../color-swatch-picker/color-swatch-picker-state';
import { Color } from '../color/color';

/**
 * Public state surface for a Color Swatch Picker Item primitive.
 */
export interface NgpColorSwatchPickerItemState {
  /** Whether this swatch is the selected color. */
  readonly selected: Signal<boolean>;
}

/**
 * Inputs for configuring the Color Swatch Picker Item primitive.
 */
export interface NgpColorSwatchPickerItemProps {
  /** The color this swatch represents. */
  readonly color: Signal<Color>;
  /** Whether the swatch is disabled. */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpColorSwatchPickerItemStateToken,
  ngpColorSwatchPickerItem,
  injectColorSwatchPickerItemState,
  provideColorSwatchPickerItemState,
] = createPrimitive(
  'NgpColorSwatchPickerItem',
  ({
    color,
    disabled = signal(false),
  }: NgpColorSwatchPickerItemProps): NgpColorSwatchPickerItemState => {
    const element = injectElementRef<HTMLElement>();
    const picker = injectColorSwatchPickerState();

    // Compose roving focus so this swatch participates in single-tab-stop keyboard navigation.
    ngpRovingFocusItem({ disabled });

    const selected = computed(() => picker().isSelected(color()));

    // Host bindings — an option in the listbox.
    attrBinding(element, 'role', 'option');
    attrBinding(element, 'aria-selected', () => (selected() ? 'true' : 'false'));
    attrBinding(element, 'aria-label', () => color().toHex());
    dataBinding(element, 'data-selected', selected);
    dataBinding(element, 'data-disabled', disabled);
    styleBinding(element, '--ngp-color-swatch-color', () => color().toRgba());

    ngpInteractions({ hover: true, focusVisible: true, press: true, disabled });

    listener(element, 'click', () => {
      if (!disabled()) {
        picker().select(color());
      }
    });

    listener(element, 'keydown', (event: KeyboardEvent) => {
      if (disabled()) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        picker().select(color());
      }
    });

    return { selected } satisfies NgpColorSwatchPickerItemState;
  },
);
