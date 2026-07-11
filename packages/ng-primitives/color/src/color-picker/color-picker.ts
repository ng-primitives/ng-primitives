import { Directive, input, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color } from '../color/color';
import { ngpColorPicker, provideColorPickerState } from './color-picker-state';

/**
 * Apply the `ngpColorPicker` directive to a container that coordinates a single color value across
 * child color components. Child areas, sliders and fields bind to the picker's value automatically.
 */
@Directive({
  selector: '[ngpColorPicker]',
  exportAs: 'ngpColorPicker',
  providers: [provideColorPickerState()],
})
export class NgpColorPicker {
  /** The id of the picker. */
  readonly id = input<string>(uniqueId('ngp-color-picker'));

  /** The color value. */
  readonly value = input<Color>(Color.parse('#ff0000'), {
    alias: 'ngpColorPickerValue',
  });

  /** Emits when the value changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorPickerValueChange',
  });

  protected readonly state = ngpColorPicker({
    id: this.id,
    value: this.value,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Set the value of the picker. */
  setValue(value: Color, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }
}
