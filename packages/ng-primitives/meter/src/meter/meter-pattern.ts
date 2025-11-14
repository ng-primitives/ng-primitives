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
import { attrBinding } from 'ng-primitives/state';
import { NgpMeterValueTextFn } from './meter';

/**
 * The state interface for the Meter pattern.
 */
export interface NgpMeterState {
  percentage: Signal<number>;
}

/**
 * The props interface for the Meter pattern.
 */
export interface NgpMeterProps {
  /**
   * The element reference for the meter.
   */
  element?: ElementRef<HTMLElement>;
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
   * ValueLabel signal input.
   */
  readonly valueLabel?: Signal<NgpMeterValueTextFn>;
  /**
   * The id of the label associated with the meter.
   */
  readonly label?: Signal<string | null>;
}

/**
 * The Meter pattern function.
 */
export function ngpMeterPattern({
  element = injectElementRef(),
  value = signal(0),
  min = signal(0),
  max = signal(100),
  label = signal<string | null>(null),
  valueLabel = signal((value, max) => `${Math.round((value / max) * 100)}%`),
}: NgpMeterProps = {}): NgpMeterState {
  /** @internal The percentage of the meter. */
  const percentage = computed(() => {
    const _value = value();
    const _min = min();
    const _max = max();

    if (_value == null) {
      return 0;
    }

    if (_value < _min) {
      return 0;
    }

    if (_value > _max) {
      return 100;
    }

    return ((_value - _min) / (_max - _min)) * 100;
  });

  // Host bindings
  attrBinding(element, 'role', 'meter');
  attrBinding(element, 'aria-valuenow', percentage);
  attrBinding(element, 'aria-valuemin', min);
  attrBinding(element, 'aria-valuemax', max);
  attrBinding(
    element,
    'aria-valuetext',
    computed(() => valueLabel()(value(), max())),
  );
  attrBinding(element, 'aria-labelledby', label);

  return {
    percentage,
  };
}

/**
 * The injection token for the Meter pattern.
 */
export const NgpMeterPatternToken = new InjectionToken<NgpMeterState>('NgpMeterPatternToken');

/**
 * Injects the Meter pattern.
 */
export function injectMeterPattern(): NgpMeterState {
  return inject(NgpMeterPatternToken);
}

/**
 * Provides the Meter pattern.
 */
export function provideMeterPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpMeterState,
): FactoryProvider {
  return { provide: NgpMeterPatternToken, useFactory: () => fn(inject(type)) };
}
