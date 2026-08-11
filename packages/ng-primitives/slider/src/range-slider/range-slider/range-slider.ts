import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { coerceNumberOrUndefined, uniqueId } from 'ng-primitives/utils';
import { ngpRangeSlider, provideRangeSliderState } from './range-slider-state';

/**
 * Apply the `ngpRangeSlider` directive to an element that represents the range slider and contains the track, range, and thumbs.
 */
@Directive({
  selector: '[ngpRangeSlider]',
  exportAs: 'ngpRangeSlider',
  providers: [provideRangeSliderState()],
})
export class NgpRangeSlider {
  /**
   * The id of the range slider. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-range-slider'));

  /**
   * The low value of the range slider. When defined the low thumb is controlled.
   */
  readonly low = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpRangeSliderLow',
    transform: coerceNumberOrUndefined,
  });

  /**
   * The default low value for uncontrolled usage.
   * @default 0
   */
  readonly defaultLow = input<number, NumberInput>(0, {
    alias: 'ngpRangeSliderDefaultLow',
    transform: (value: NumberInput) => numberAttribute(value, 0),
  });

  /**
   * Emits when the low value changes.
   */
  readonly lowChange = output<number>({
    alias: 'ngpRangeSliderLowChange',
  });

  /**
   * The high value of the range slider. When defined the high thumb is controlled.
   */
  readonly high = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpRangeSliderHigh',
    transform: coerceNumberOrUndefined,
  });

  /**
   * The default high value for uncontrolled usage.
   * @default 100
   */
  readonly defaultHigh = input<number, NumberInput>(100, {
    alias: 'ngpRangeSliderDefaultHigh',
    transform: (value: NumberInput) => numberAttribute(value, 100),
  });

  /**
   * Emits when the high value changes.
   */
  readonly highChange = output<number>({
    alias: 'ngpRangeSliderHighChange',
  });

  /**
   * The minimum value of the range slider.
   */
  readonly min = input<number, NumberInput>(0, {
    alias: 'ngpRangeSliderMin',
    transform: numberAttribute,
  });

  /**
   * The maximum value of the range slider.
   */
  readonly max = input<number, NumberInput>(100, {
    alias: 'ngpRangeSliderMax',
    transform: numberAttribute,
  });

  /**
   * The step value of the range slider.
   */
  readonly step = input<number, NumberInput>(1, {
    alias: 'ngpRangeSliderStep',
    transform: numberAttribute,
  });

  /**
   * The orientation of the range slider.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpRangeSliderOrientation',
  });

  /**
   * The disabled state of the range slider.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRangeSliderDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the range slider.
   */
  private readonly state = ngpRangeSlider({
    id: this.id,
    low: this.low,
    defaultLow: this.defaultLow,
    high: this.high,
    defaultHigh: this.defaultHigh,
    min: this.min,
    max: this.max,
    step: this.step,
    orientation: this.orientation,
    disabled: this.disabled,
    onLowChange: value => this.lowChange.emit(value),
    onHighChange: value => this.highChange.emit(value),
  });
}
