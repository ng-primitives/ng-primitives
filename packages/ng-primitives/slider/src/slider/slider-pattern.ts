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
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, dataBinding } from 'ng-primitives/state';
import { NgpOrientation } from 'ng-primitives/common';
import { setupFormControl } from 'ng-primitives/form-field';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the Slider pattern.
 */
export interface NgpSliderState {
  /** The value signal. */
  readonly value: Signal<number>;
  /** The min signal. */
  readonly min: Signal<number>;
  /** The max signal. */
  readonly max: Signal<number>;
  /** The step signal. */
  readonly step: Signal<number>;
  /** The orientation signal. */
  readonly orientation: Signal<NgpOrientation>;
  /** The disabled signal. */
  readonly disabled: Signal<boolean>;
  /** The percentage computed signal. */
  readonly percentage: Signal<number>;
  /** The track element reference. */
  readonly track: Signal<ElementRef<HTMLElement> | undefined>;
  /** Sets the track element reference. */
  setTrack: (el: ElementRef<HTMLElement> | undefined) => void;
  /** Sets the value. */
  setValue: (newValue: number) => void;
}

/**
 * The props interface for the Slider pattern.
 */
export interface NgpSliderProps {
  /**
   * The element reference for the slider.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
  /**
   * Value signal input.
   */
  readonly value?: Signal<number>;
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
   * Event listener for valueChange events.
   */
  readonly onValueChange?: (value: number) => void;
}

/**
 * The Slider pattern function.
 */
export function ngpSliderPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-slider')),
  value: _value = signal(0),
  min = signal(0),
  max = signal(100),
  step = signal(1),
  orientation = signal('horizontal'),
  disabled = signal(false),
  onValueChange,
}: NgpSliderProps = {}): NgpSliderState {
  // Signals and computed values
  const value = controlled(_value);
  const track = signal<ElementRef<HTMLElement> | undefined>(undefined);
  const percentage = computed(() => ((value() - min()) / (max() - min())) * 100);

  // Constructor logic
  setupFormControl({ id, disabled });

  // Host bindings
  attrBinding(element, 'id', id);
  dataBinding(element, 'data-orientation', orientation);

  function setTrack(el: ElementRef<HTMLElement> | undefined): void {
    track.set(el);
  }

  function setValue(newValue: number): void {
    const clampedValue = Math.min(Math.max(newValue, min()), max());
    value.set(clampedValue);
    if (onValueChange) {
      onValueChange(clampedValue);
    }
  }

  return {
    value,
    min,
    max,
    step,
    orientation,
    disabled,
    percentage,
    track: track.asReadonly(),
    setTrack,
    setValue,
  };
}

/**
 * The injection token for the Slider pattern.
 */
export const NgpSliderPatternToken = new InjectionToken<NgpSliderState>('NgpSliderPatternToken');

/**
 * Injects the Slider pattern.
 */
export function injectSliderPattern(): NgpSliderState {
  return inject(NgpSliderPatternToken);
}

/**
 * Provides the Slider pattern.
 */
export function provideSliderPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSliderState,
): FactoryProvider {
  return { provide: NgpSliderPatternToken, useFactory: () => fn(inject(type)) };
}
