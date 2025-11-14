import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import { ngpRangeSliderPattern, provideRangeSliderPattern } from './range-slider-pattern';

/**
 * Apply the `ngpRangeSlider` directive to an element that represents the range slider and contains the track, range, and thumbs.
 */
@Directive({
  selector: '[ngpRangeSlider]',
  exportAs: 'ngpRangeSlider',
  providers: [provideRangeSliderPattern(NgpRangeSlider, instance => instance.pattern)],
})
export class NgpRangeSlider {
  /**
   * The id of the range slider. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-range-slider'));

  /**
   * The low value of the range slider.
   */
  readonly low = input<number, NumberInput>(0, {
    alias: 'ngpRangeSliderLow',
    transform: numberAttribute,
  });

  /**
   * Emits when the low value changes.
   */
  readonly lowChange = output<number>({
    alias: 'ngpRangeSliderLowChange',
  });

  /**
   * The high value of the range slider.
   */
  readonly high = input<number, NumberInput>(100, {
    alias: 'ngpRangeSliderHigh',
    transform: numberAttribute,
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
   * The pattern instance.
   */
  protected readonly pattern = ngpRangeSliderPattern({
    id: this.id,
    low: this.low,
    high: this.high,
    min: this.min,
    max: this.max,
    step: this.step,
    orientation: this.orientation,
    disabled: this.disabled,
    onLowChange: (value: number) => this.lowChange.emit(value),
    onHighChange: (value: number) => this.highChange.emit(value),
  });
}
