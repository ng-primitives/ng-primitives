import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { setupFormControl } from 'ng-primitives/form-field';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the RangeSlider pattern.
 */
export interface NgpRangeSliderState {
  /**
   * The orientation of the range slider.
   */
  readonly orientation: Signal<NgpOrientation>;
  /**
   * Whether the range slider is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * The low value of the range slider.
   */
  readonly low: Signal<number>;
  /**
   * The high value of the range slider.
   */
  readonly high: Signal<number>;
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
   * The low value as a percentage of the total range.
   */
  readonly lowPercentage: Signal<number>;
  /**
   * The high value as a percentage of the total range.
   */
  readonly highPercentage: Signal<number>;
  /**
   * The range between low and high as a percentage of the total range.
   */
  readonly rangePercentage: Signal<number>;
  /**
   * The track element reference.
   */
  readonly track: Signal<ElementRef<HTMLElement> | undefined>;
  /**
   * The list of thumb identifiers.
   */
  readonly thumbs: Signal<readonly string[]>;
  /**
   * SetLowValue method.
   */
  setLowValue: (value: number) => void;
  /**
   * SetHighValue method.
   */
  setHighValue: (value: number) => void;
  /**
   * GetClosestThumb method.
   */
  getClosestThumb: (percentage: number) => 'low' | 'high';
  /**
   * AddThumb method.
   */
  addThumb: (thumbId: string) => void;
  /**
   * RemoveThumb method.
   */
  removeThumb: (thumbId: string) => void;
  /**
   * Set the track element reference.
   */
  setTrack: (element: ElementRef<HTMLElement>) => void;
}

/**
 * The props interface for the RangeSlider pattern.
 */
export interface NgpRangeSliderProps {
  /**
   * The element reference for the range-slider.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
  /**
   * Low signal input.
   */
  readonly low?: Signal<number>;
  /**
   * High signal input.
   */
  readonly high?: Signal<number>;
  /**
   * Min signal input.
   */
  readonly min?: Signal<number>;
  /**
   * Max signal input.
   */
  readonly max?: Signal<number>;
  /**
   * Step signal input.
   */
  readonly step?: Signal<number>;
  /**
   * Orientation signal input.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Event listener for lowChange events.
   */
  readonly onLowChange?: (value: number) => void;
  /**
   * Event listener for highChange events.
   */
  readonly onHighChange?: (value: number) => void;
}

/**
 * The RangeSlider pattern function.
 */
export function ngpRangeSliderPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-range-slider')),
  low: _low = signal(0),
  high: _high = signal(100),
  min = signal(0),
  max = signal(100),
  step = signal(1),
  orientation = signal('horizontal'),
  disabled = signal(false),
  onLowChange,
  onHighChange,
}: NgpRangeSliderProps = {}): NgpRangeSliderState {
  const low = controlled(_low);
  const high = controlled(_high);

  // Signals and computed values
  const track = signal<ElementRef<HTMLElement> | undefined>(undefined);
  const thumbs = signal<string[]>([]);
  const lowPercentage = computed(() => ((low() - min()) / (max() - min())) * 100);
  const highPercentage = computed(() => ((high() - min()) / (max() - min())) * 100);
  const rangePercentage = computed(() => highPercentage() - lowPercentage());

  // Constructor logic
  setupFormControl({ id: id, disabled: disabled });

  // Host bindings
  attrBinding(element, 'id', id);
  dataBinding(element, 'data-orientation', orientation);

  // Method implementations
  function setLowValue(value: number): void {
    const clampedValue = Math.max(min(), Math.min(value, high()));
    low.set(clampedValue);
    onLowChange?.(clampedValue);
  }
  function setHighValue(value: number): void {
    const clampedValue = Math.min(max(), Math.max(value, low()));
    high.set(clampedValue);
    onHighChange?.(clampedValue);
  }
  function getClosestThumb(percentage: number): 'low' | 'high' {
    const value = min() + (max() - min()) * (percentage / 100);
    const distanceToLow = Math.abs(value - low());
    const distanceToHigh = Math.abs(value - high());

    return distanceToLow <= distanceToHigh ? 'low' : 'high';
  }
  function addThumb(thumbId: string): void {
    thumbs.update(thumbs => [...thumbs, thumbId]);
  }

  function removeThumb(thumbId: string): void {
    thumbs.update(thumbs => thumbs.filter(t => t !== thumbId));
  }

  function setTrack(elementRef: ElementRef<HTMLElement>): void {
    track.set(elementRef);
  }

  return {
    orientation,
    disabled,
    low,
    high,
    min,
    max,
    step,
    thumbs: thumbs.asReadonly(),
    track: track.asReadonly(),
    lowPercentage,
    highPercentage,
    rangePercentage,
    setLowValue,
    setHighValue,
    getClosestThumb,
    addThumb,
    removeThumb,
    setTrack,
  };
}

/**
 * The injection token for the RangeSlider pattern.
 */
export const NgpRangeSliderPatternToken = new InjectionToken<NgpRangeSliderState>(
  'NgpRangeSliderPatternToken',
);

/**
 * Injects the RangeSlider pattern.
 */
export function injectRangeSliderPattern(): NgpRangeSliderState {
  return inject(NgpRangeSliderPatternToken);
}

/**
 * Provides the RangeSlider pattern.
 */
export function provideRangeSliderPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRangeSliderState,
): FactoryProvider {
  return { provide: NgpRangeSliderPatternToken, useFactory: () => fn(inject(type)) };
}
