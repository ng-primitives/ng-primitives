import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { Color } from '../color/color';
import {
  ngpColorSwatchPickerItem,
  provideColorSwatchPickerItemState,
} from './color-swatch-picker-item-state';

/**
 * Apply the `ngpColorSwatchPickerItem` directive to a selectable swatch within a swatch picker. Set its
 * background to `var(--ngp-color-swatch-color)`. It composes a roving focus item.
 */
@Directive({
  selector: '[ngpColorSwatchPickerItem]',
  exportAs: 'ngpColorSwatchPickerItem',
  providers: [provideColorSwatchPickerItemState(), provideRovingFocusItemState()],
})
export class NgpColorSwatchPickerItem {
  /** The color this swatch represents. */
  readonly color = input<Color>(Color.parse('#000000'), {
    alias: 'ngpColorSwatchPickerItem',
  });

  /** Whether the swatch is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorSwatchPickerItemDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorSwatchPickerItem({
    color: this.color,
    disabled: this.disabled,
  });
}
