import { computed, ElementRef, Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Inputs for configuring the RangeSlider primitive.
 */
export interface NgpRangeSliderProps {
  /**
   * The id of the range slider.
   */
  readonly id?: Signal<string>;
  /**
   * The low value of the range slider.
   */
  readonly low?: Signal<number>;
  /**
   * The high value of the range slider.
   */
  readonly high?: Signal<number>;
  /**
   * The minimum value.
   */
  readonly min?: Signal<number>;
  /**
   * The maximum value.
   */
  readonly max?: Signal<number>;
  /**
   * The step value.
   */
  readonly step?: Signal<number>;
  /**
   * The range slider orientation.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Whether the range slider is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the low value changes.
   */
  readonly onLowChange?: (value: number) => void;
  /**
   * Callback fired when the high value changes.
   */
  readonly onHighChange?: (value: number) => void;
}

/**
 * Public state surface for the RangeSlider primitive.
 */
export interface NgpRangeSliderState {
  /**
   * The id of the range slider.
   */
  readonly id: Signal<string>;
  /**
   * The low value of the range slider.
   */
  readonly low: WritableSignal<number>;
  /**
   * The high value of the range slider.
   */
  readonly high: WritableSignal<number>;
  /**
   * The minimum value of the range slider.
   */
  readonly min: Signal<number>;
  /**
   * The maximum value of the range slider.
   */
  readonly max: Signal<number>;
  /**
   * The step value of the range slider.
   */
  readonly step: Signal<number>;
  /**
   * The orientation of the range slider.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
  /**
   * Whether the range slider is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The low value as a percentage based on the min and max values.
   * @internal
   */
  readonly lowPercentage: Signal<number>;
  /**
   * The high value as a percentage based on the min and max values.
   * @internal
   */
  readonly highPercentage: Signal<number>;
  /**
   * The range between low and high values as a percentage.
   * @internal
   */
  readonly rangePercentage: Signal<number>;
  /**
   * @internal The track element reference.
   */
  readonly track: Signal<ElementRef<HTMLElement> | undefined>;
  /**
   * @internal The thumbs array.
   */
  readonly thumbs: Signal<ElementRef<HTMLElement>[]>;
  /**
   * Emit when the low value changes.
   */
  readonly lowChange: Observable<number>;
  /**
   * Emit when the high value changes.
   */
  readonly highChange: Observable<number>;
  /**
   * Updates the low value, ensuring it doesn't exceed the high value.
   */
  setLowValue(value: number): void;
  /**
   * Updates the high value, ensuring it doesn't go below the low value.
   */
  setHighValue(value: number): void;
  /**
   * Determines which thumb should be moved based on the position clicked.
   */
  getClosestThumb(percentage: number): 'low' | 'high';
  /**
   * Updates the thumbs array when a new thumb is added.
   */
  addThumb(thumb: ElementRef<HTMLElement>): void;
  /**
   * Removes a thumb from the thumbs array.
   */
  removeThumb(thumb: ElementRef<HTMLElement>): void;
  /**
   * Set the track element reference.
   */
  setTrack(track: ElementRef<HTMLElement>): void;
  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void;
  /**
   * Set the orientation.
   */
  setOrientation(orientation: NgpOrientation): void;
}

export const [
  NgpRangeSliderStateToken,
  ngpRangeSlider,
  injectRangeSliderState,
  provideRangeSliderState,
] = createPrimitive(
  'NgpRangeSlider',
  ({
    id = signal(uniqueId('ngp-range-slider')),
    low: _low = signal(0),
    high: _high = signal(100),
    min = signal(0),
    max = signal(100),
    step = signal(1),
    orientation: _orientation = signal<NgpOrientation>('horizontal'),
    disabled: _disabled = signal(false),
    onLowChange,
    onHighChange,
  }: NgpRangeSliderProps): NgpRangeSliderState => {
    const element = injectElementRef();
    const low = controlled(_low);
    const high = controlled(_high);
    const disabled = controlled(_disabled);
    const orientation = controlled(_orientation);

    const lowChange = emitter<number>();
    const highChange = emitter<number>();
    const track = signal<ElementRef<HTMLElement> | undefined>(undefined);
    const thumbs = signal<ElementRef<HTMLElement>[]>([]);

    // Form control integration
    const status = ngpFormControl({ id, disabled });

    const lowPercentage = computed(() => {
      const range = max() - min();
      if (range <= 0) return 0;
      return ((low() - min()) / range) * 100;
    });

    const highPercentage = computed(() => {
      const range = max() - min();
      if (range <= 0) return 100;
      return ((high() - min()) / range) * 100;
    });

    const rangePercentage = computed(() => highPercentage() - lowPercentage());

    // Host bindings
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-orientation', orientation);
    dataBinding(element, 'data-disabled', status().disabled);

    function setLowValue(value: number): void {
      const clampedValue = Math.max(min(), Math.min(value, high()));
      const steppedValue = Math.round((clampedValue - min()) / step()) * step() + min();
      low.set(steppedValue);
      onLowChange?.(steppedValue);
      lowChange.emit(steppedValue);
    }

    function setHighValue(value: number): void {
      const clampedValue = Math.min(max(), Math.max(value, low()));
      const steppedValue = Math.round((clampedValue - min()) / step()) * step() + min();
      high.set(steppedValue);
      onHighChange?.(steppedValue);
      highChange.emit(steppedValue);
    }

    function getClosestThumb(percentage: number): 'low' | 'high' {
      const value = min() + (max() - min()) * (percentage / 100);
      const distanceToLow = Math.abs(value - low());
      const distanceToHigh = Math.abs(value - high());
      return distanceToLow <= distanceToHigh ? 'low' : 'high';
    }

    function addThumb(thumb: ElementRef<HTMLElement>): void {
      thumbs.update(t => [...t, thumb]);
    }

    function removeThumb(thumb: ElementRef<HTMLElement>): void {
      thumbs.update(t => t.filter(existing => existing !== thumb));
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      orientation.set(newOrientation);
    }

    function setTrack(newTrack: ElementRef<HTMLElement>): void {
      track.set(newTrack);
    }

    return {
      id,
      low,
      high,
      min,
      max,
      step,
      orientation: deprecatedSetter(orientation, 'setOrientation'),
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      lowPercentage,
      highPercentage,
      rangePercentage,
      track,
      thumbs,
      lowChange: lowChange.asObservable(),
      highChange: highChange.asObservable(),
      setLowValue,
      setHighValue,
      getClosestThumb,
      addThumb,
      removeThumb,
      setDisabled,
      setOrientation,
      setTrack,
    } satisfies NgpRangeSliderState;
  },
);
