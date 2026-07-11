import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color, ColorChannel, ColorSpace } from '../color/color';
import { ngpColorArea, provideColorAreaState } from './color-area-state';

/**
 * Apply the `ngpColorArea` directive to a 2D surface that adjusts two channels of a color value.
 * The surface should set its background to `var(--ngp-color-area-background)` and contain a thumb.
 */
@Directive({
  selector: '[ngpColorArea]',
  exportAs: 'ngpColorArea',
  providers: [provideColorAreaState()],
})
export class NgpColorArea {
  /** The id of the area. */
  readonly id = input<string>(uniqueId('ngp-color-area'));

  /** The color value. */
  readonly value = input<Color>(Color.parse('hsb(0, 100%, 100%)'), {
    alias: 'ngpColorAreaValue',
  });

  /** Emits when the value changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorAreaValueChange',
  });

  /** The channel mapped to the horizontal axis. */
  readonly xChannel = input<ColorChannel>('saturation', {
    alias: 'ngpColorAreaXChannel',
  });

  /** The channel mapped to the vertical axis. */
  readonly yChannel = input<ColorChannel>('brightness', {
    alias: 'ngpColorAreaYChannel',
  });

  /** The color space to operate in. Resolved from the channels/value when not set. */
  readonly colorSpace = input<ColorSpace | undefined>(undefined, {
    alias: 'ngpColorAreaColorSpace',
  });

  /** The disabled state of the area. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorAreaDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorArea({
    id: this.id,
    value: this.value,
    xChannel: this.xChannel,
    yChannel: this.yChannel,
    colorSpace: this.colorSpace,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Set the value of the area. */
  setValue(value: Color, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }

  /** Set the disabled state. */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }
}
