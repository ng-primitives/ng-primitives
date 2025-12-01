import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSlider, provideSliderState } from './slider-state';

/**
 * Apply the `ngpSlider` directive to an element that represents the slider and contains the track, range, and thumb.
 */
@Directive({
  selector: '[ngpSlider]',
  exportAs: 'ngpSlider',
  providers: [provideSliderState()],
})
export class NgpSlider {
  /**
   * The id of the slider. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-slider'));

  /**
   * The value of the slider.
   */
  readonly value = input<number, NumberInput>(0, {
    alias: 'ngpSliderValue',
    transform: numberAttribute,
  });

  /**
   * Emits when the value changes.
   */
  readonly valueChange = output<number>({
    alias: 'ngpSliderValueChange',
  });

  /**
   * The minimum value of the slider.
   */
  readonly min = input<number, NumberInput>(0, {
    alias: 'ngpSliderMin',
    transform: numberAttribute,
  });

  /**
   * The maximum value of the slider.
   */
  readonly max = input<number, NumberInput>(100, {
    alias: 'ngpSliderMax',
    transform: numberAttribute,
  });

  /**
   * The step value of the slider.
   */
  readonly step = input<number, NumberInput>(1, {
    alias: 'ngpSliderStep',
    transform: numberAttribute,
  });

  /**
   * The orientation of the slider.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpSliderOrientation',
  });

  /**
   * The disabled state of the slider.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSliderDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the slider. We use this for the slider state rather than relying on the inputs.
   * @internal
   */
  protected readonly state = ngpSlider({
    id: this.id,
    value: this.value,
    min: this.min,
    max: this.max,
    step: this.step,
    orientation: this.orientation,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });
}
