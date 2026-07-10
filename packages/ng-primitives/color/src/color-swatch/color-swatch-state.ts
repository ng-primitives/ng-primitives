import { computed, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, styleBinding } from 'ng-primitives/state';
import { injectColorPickerState } from '../color-picker/color-picker-state';
import { Color } from '../color/color';

/**
 * Public state surface for the Color Swatch primitive - a non-interactive preview of a color.
 */
export interface NgpColorSwatchState {
  /** The color being displayed. */
  readonly color: Signal<Color>;
}

/**
 * Inputs for configuring the Color Swatch primitive.
 */
export interface NgpColorSwatchProps {
  /** The color to display. Falls back to the parent picker's value when omitted. */
  readonly color?: Signal<Color | undefined>;
  /** An accessible label. Defaults to the color's hex string. */
  readonly label?: Signal<string | undefined>;
}

export const [
  NgpColorSwatchStateToken,
  ngpColorSwatch,
  injectColorSwatchState,
  provideColorSwatchState,
] = createPrimitive(
  'NgpColorSwatch',
  ({ color: _color, label }: NgpColorSwatchProps): NgpColorSwatchState => {
    const element = injectElementRef<HTMLElement>();
    const picker = injectColorPickerState({ optional: true });

    const color = computed(() => _color?.() ?? picker()?.value() ?? Color.parse('#000000'));

    // A swatch is a picture of a color for assistive tech.
    attrBinding(element, 'role', 'img');
    attrBinding(element, 'aria-label', () => label?.() ?? color().toHex());
    // Expose the color (with alpha) as a custom property to opt into as a background.
    styleBinding(element, '--ngp-color-swatch-color', () => color().toRgba());

    return { color } satisfies NgpColorSwatchState;
  },
);
