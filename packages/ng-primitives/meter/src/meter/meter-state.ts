import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive } from 'ng-primitives/state';
import { NgpMeterValueTextFn } from './meter';

export interface NgpMeterProps {
  /**
   * Define the meter value.
   * @default 0
   */
  readonly value?: Signal<number>;

  /**
   * Define the meter min value.
   * @default 0
   */
  readonly min?: Signal<number>;

  /**
   * Define the meter max value.
   * @default 100
   */
  readonly max?: Signal<number>;

  /**
   * Define a function that returns the meter value label.
   * @param value The current value
   * @param max The maximum value
   * @param min The minimum value
   * @returns The value label
   */
  readonly valueLabel?: Signal<NgpMeterValueTextFn>;
}

export interface NgpMeterState {
  /**
   * Define the meter value.
   */
  readonly value: WritableSignal<number>;

  /**
   * Define the meter min value.
   */
  readonly min: WritableSignal<number>;

  /**
   * Define the meter max value.
   */
  readonly max: WritableSignal<number>;

  /**
   * Define a function that returns the meter value label.
   */
  readonly valueLabel: WritableSignal<NgpMeterValueTextFn>;

  /**
   * The raw value exposed via `aria-valuenow`, clamped to the [min, max] range.
   * @internal
   */
  readonly valueNow: Signal<number>;

  /**
   * The id of the label associated with the meter.
   * @internal
   */
  readonly labelId: WritableSignal<string | undefined>;
}

export const [NgpMeterStateToken, ngpMeter, injectMeterState, provideMeterState] = createPrimitive(
  'NgpMeter',
  ({
    value: _value = signal(0),
    min: _min = signal(0),
    max: _max = signal(100),
    valueLabel: _valueLabel = signal(
      (value, max, min) => `${max === min ? 0 : Math.round(((value - min) / (max - min)) * 100)}%`,
    ),
  }: NgpMeterProps): NgpMeterState => {
    const element = injectElementRef();

    // Controlled properties
    const value = controlled(_value);
    const min = controlled(_min);
    const max = controlled(_max);
    const valueLabel = controlled(_valueLabel);

    const labelId = signal<string | undefined>(undefined);

    /**
     * The raw value exposed via `aria-valuenow`, clamped to the [min, max] range.
     * Per the ARIA meter pattern, `aria-valuenow` is the actual value, not a percentage.
     */
    const valueNow = computed(() => Math.min(Math.max(value(), min()), max()));

    // Attribute bindings
    attrBinding(element, 'role', 'meter');
    attrBinding(element, 'aria-valuemin', min);
    attrBinding(element, 'aria-valuemax', max);
    attrBinding(element, 'aria-valuenow', valueNow);
    attrBinding(element, 'aria-valuetext', () => valueLabel()(value(), max(), min()));
    attrBinding(element, 'aria-labelledby', () => labelId() ?? null);

    return {
      value,
      min,
      max,
      valueLabel,
      valueNow,
      labelId,
    } satisfies NgpMeterState;
  },
);
