import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  Directive,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { setupFormControl } from 'ng-primitives/form-field';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpSliderTrack } from '../slider-track/slider-track';
import { provideRangeSliderState, rangeSliderState } from './range-slider-state';

/**
 * Apply the `ngpRangeSlider` directive to an element that represents the range slider and contains the track, range, and thumbs.
 */
@Directive({
  selector: '[ngpRangeSlider]',
  exportAs: 'ngpRangeSlider',
  providers: [provideRangeSliderState()],
  host: {
    '[id]': 'id()',
    '[attr.data-orientation]': 'state.orientation()',
  },
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
   * Access the slider track.
   * @internal
   */
  readonly track = signal<NgpSliderTrack | undefined>(undefined);

  /**
   * The low value as a percentage based on the min and max values.
   */
  readonly lowPercentage = computed(
    () => ((this.state.low() - this.state.min()) / (this.state.max() - this.state.min())) * 100,
  );

  /**
   * The high value as a percentage based on the min and max values.
   */
  readonly highPercentage = computed(
    () => ((this.state.high() - this.state.min()) / (this.state.max() - this.state.min())) * 100,
  );

  /**
   * The range between low and high values as a percentage.
   */
  readonly rangePercentage = computed(() => this.highPercentage() - this.lowPercentage());

  /**
   * The state of the range slider. We use this for the range slider state rather than relying on the inputs.
   * @internal
   */
  protected readonly state = rangeSliderState<NgpRangeSlider>(this);

  /**
   * Updates the low value, ensuring it doesn't exceed the high value.
   * @param value The new low value
   */
  updateLowValue(value: number): void {
    const clampedValue = Math.max(this.state.min(), Math.min(value, this.state.high()));
    this.state.low.set(clampedValue);
    this.lowChange.emit(clampedValue);
  }

  /**
   * Updates the high value, ensuring it doesn't go below the low value.
   * @param value The new high value
   */
  updateHighValue(value: number): void {
    const clampedValue = Math.min(this.state.max(), Math.max(value, this.state.low()));
    this.state.high.set(clampedValue);
    this.highChange.emit(clampedValue);
  }

  /**
   * Determines which thumb should be moved based on the position clicked.
   * @param percentage The percentage position of the click
   * @returns 'low' or 'high' indicating which thumb should move
   */
  getClosestThumb(percentage: number): 'low' | 'high' {
    const value = this.state.min() + (this.state.max() - this.state.min()) * (percentage / 100);
    const distanceToLow = Math.abs(value - this.state.low());
    const distanceToHigh = Math.abs(value - this.state.high());

    return distanceToLow <= distanceToHigh ? 'low' : 'high';
  }

  constructor() {
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }
}
