import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { provideSliderState } from 'ng-primitives/slider';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color, ColorChannel, ColorSpace } from '../color/color';
import { ngpColorSlider, provideColorSliderState } from './color-slider-state';

/**
 * Apply the `ngpColorSlider` directive to an element that contains a color slider track and thumb.
 * A color slider adjusts a single channel (e.g. hue, saturation, alpha) of a color value. It composes
 * the underlying slider primitive, so it provides the slider state its track and thumb parts read.
 */
@Directive({
  selector: '[ngpColorSlider]',
  exportAs: 'ngpColorSlider',
  providers: [provideColorSliderState(), provideSliderState({ inherit: false })],
})
export class NgpColorSlider {
  /** The id of the slider. */
  readonly id = input<string>(uniqueId('ngp-color-slider'));

  /** The color value. */
  readonly value = input<Color | undefined>(undefined, {
    alias: 'ngpColorSliderValue',
  });

  /** The default color value for uncontrolled usage. */
  readonly defaultValue = input<Color>(Color.parse('#ff0000'), {
    alias: 'ngpColorSliderDefaultValue',
  });

  /** Emits when the value changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorSliderValueChange',
  });

  /** The channel this slider adjusts. */
  readonly channel = input<ColorChannel>('hue', {
    alias: 'ngpColorSliderChannel',
  });

  /** The color space to operate in. Resolved from the channel/value when not set. */
  readonly colorSpace = input<ColorSpace | undefined>(undefined, {
    alias: 'ngpColorSliderColorSpace',
  });

  /** The orientation of the slider. */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpColorSliderOrientation',
  });

  /** The disabled state of the slider. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorSliderDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorSlider({
    id: this.id,
    value: this.value,
    defaultValue: this.defaultValue,
    channel: this.channel,
    colorSpace: this.colorSpace,
    orientation: this.orientation,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Set the value of the slider. */
  setValue(value: Color, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }

  /** Set the disabled state. */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }

  /** Set the orientation. */
  setOrientation(orientation: NgpOrientation): void {
    this.state.setOrientation(orientation);
  }
}
