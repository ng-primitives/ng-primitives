import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color } from '../color/color';
import { ngpColorSwatchPicker, provideColorSwatchPickerState } from './color-swatch-picker-state';

/**
 * Apply the `ngpColorSwatchPicker` directive to a container of selectable color swatches. It composes
 * roving focus for keyboard navigation, so it provides the roving focus group state.
 */
@Directive({
  selector: '[ngpColorSwatchPicker]',
  exportAs: 'ngpColorSwatchPicker',
  providers: [provideColorSwatchPickerState(), provideRovingFocusGroupState({ inherit: false })],
})
export class NgpColorSwatchPicker {
  /** The id of the swatch picker. */
  readonly id = input<string>(uniqueId('ngp-color-swatch-picker'));

  /** The selected color. */
  readonly value = input<Color | undefined>(undefined, {
    alias: 'ngpColorSwatchPickerValue',
  });

  /** Emits when the selected color changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorSwatchPickerValueChange',
  });

  /** The orientation of the swatch list. */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpColorSwatchPickerOrientation',
  });

  /** The disabled state of the swatch picker. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorSwatchPickerDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorSwatchPicker({
    id: this.id,
    value: this.value,
    orientation: this.orientation,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Select a color. */
  select(color: Color, options?: SetterOptions): void {
    this.state.select(color, options);
  }
}
