import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpSliderTrack } from '../slider-track/slider-track';
import { ngpSliderPattern, provideSliderPattern } from './slider-pattern';

/**
 * Apply the `ngpSlider` directive to an element that represents the slider and contains the track, range, and thumb.
 */
@Directive({
  selector: '[ngpSlider]',
  exportAs: 'ngpSlider',
  providers: [provideSliderPattern(NgpSlider, instance => instance.pattern)],
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
   * The pattern instance.
   */
  protected readonly pattern = ngpSliderPattern({
    id: this.id,
    value: this.value,
    min: this.min,
    max: this.max,
    step: this.step,
    orientation: this.orientation,
    disabled: this.disabled,
    onValueChange: (value: number) => this.valueChange.emit(value),
  });

  /**
   * Access the slider track.
   * @internal
   */
  readonly track = signal<NgpSliderTrack | undefined>(undefined);
}
