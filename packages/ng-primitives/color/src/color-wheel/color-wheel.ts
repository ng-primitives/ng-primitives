import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color, ColorSpace } from '../color/color';
import { ngpColorWheel, provideColorWheelState } from './color-wheel-state';

/**
 * Apply the `ngpColorWheel` directive to a circular element that adjusts the hue channel of a color.
 * Set its background to `var(--ngp-color-wheel-background)` and contain a thumb.
 */
@Directive({
  selector: '[ngpColorWheel]',
  exportAs: 'ngpColorWheel',
  providers: [provideColorWheelState()],
})
export class NgpColorWheel {
  /** The id of the wheel. */
  readonly id = input<string>(uniqueId('ngp-color-wheel'));

  /** The color value. */
  readonly value = input<Color>(Color.parse('hsl(0, 100%, 50%)'), {
    alias: 'ngpColorWheelValue',
  });

  /** Emits when the value changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorWheelValueChange',
  });

  /** The color space to operate in. */
  readonly colorSpace = input<ColorSpace>('hsl', {
    alias: 'ngpColorWheelColorSpace',
  });

  /** The disabled state of the wheel. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorWheelDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorWheel({
    id: this.id,
    value: this.value,
    colorSpace: this.colorSpace,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Set the value of the wheel. */
  setValue(value: Color, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }

  /** Set the disabled state. */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }
}
