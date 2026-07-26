import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { computed, ElementRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
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
   * The low value of the range slider. When defined the low thumb is controlled.
   */
  readonly low?: Signal<number | undefined>;
  /**
   * The default low value for uncontrolled usage.
   */
  readonly defaultLow?: Signal<number>;
  /**
   * The high value of the range slider. When defined the high thumb is controlled.
   */
  readonly high?: Signal<number | undefined>;
  /**
   * The default high value for uncontrolled usage.
   */
  readonly defaultHigh?: Signal<number>;
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
  setLowValue(value: number, options?: SetterOptions): void;
  /**
   * Updates the high value, ensuring it doesn't go below the low value.
   */
  setHighValue(value: number, options?: SetterOptions): void;
  /**
   * Set the default low value used in uncontrolled mode.
   */
  setDefaultLow(value: number): void;
  /**
   * Set the default high value used in uncontrolled mode.
   */
  setDefaultHigh(value: number): void;
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
   * Focus the specified thumb element.
   */
  focusThumb(thumb: 'low' | 'high', origin: FocusOrigin): void;
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
    low: _low = signal<number | undefined>(undefined),
    defaultLow: _defaultLow,
    high: _high = signal<number | undefined>(undefined),
    defaultHigh: _defaultHigh,
    min = signal(0),
    max = signal(100),
    step = signal(1),
    orientation: _orientation = signal<NgpOrientation>('horizontal'),
    disabled: _disabled = signal(false),
    onLowChange,
    onHighChange,
  }: NgpRangeSliderProps): NgpRangeSliderState => {
    const element = injectElementRef();
    const focusMonitor = inject(FocusMonitor);
    const defaultLow = controlled(_defaultLow, 0);
    const defaultHigh = controlled(_defaultHigh, 100);
    const [low, setLowInternal, lowChange] = controlledState<number>({
      value: _low,
      defaultValue: defaultLow,
      onChange: onLowChange,
    });
    const [high, setHighInternal, highChange] = controlledState<number>({
      value: _high,
      defaultValue: defaultHigh,
      onChange: onHighChange,
    });
    const disabled = controlled(_disabled);
    const orientation = controlled(_orientation);

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

    function setLowValue(value: number, options?: SetterOptions): void {
      const clampedValue = Math.max(min(), Math.min(value, high()));
      const steppedValue = Math.round((clampedValue - min()) / step()) * step() + min();
      setLowInternal(steppedValue, options);
    }

    function setHighValue(value: number, options?: SetterOptions): void {
      const clampedValue = Math.min(max(), Math.max(value, low()));
      const steppedValue = Math.round((clampedValue - min()) / step()) * step() + min();
      setHighInternal(steppedValue, options);
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

    function focusThumb(thumb: 'low' | 'high', origin: FocusOrigin): void {
      const index = thumb === 'low' ? 0 : 1;
      const el = thumbs()[index];
      if (el) {
        focusMonitor.focusVia(el, origin, { preventScroll: true });
      }
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
      low: deprecatedSetter(low, 'setLowValue', setLowValue),
      high: deprecatedSetter(high, 'setHighValue', setHighValue),
      min,
      max,
      step,
      orientation: deprecatedSetter(orientation, 'setOrientation', setOrientation),
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      lowPercentage,
      highPercentage,
      rangePercentage,
      track,
      thumbs,
      lowChange,
      highChange,
      setLowValue,
      setHighValue,
      setDefaultLow: defaultLow.set,
      setDefaultHigh: defaultHigh.set,
      getClosestThumb,
      addThumb,
      removeThumb,
      focusThumb,
      setDisabled,
      setOrientation,
      setTrack,
    } satisfies NgpRangeSliderState;
  },
);
