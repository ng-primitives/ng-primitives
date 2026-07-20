import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';
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
  readonly value: Signal<number>;

  /**
   * Define the meter min value.
   */
  readonly min: Signal<number>;

  /**
   * Define the meter max value.
   */
  readonly max: Signal<number>;

  /**
   * Register the id of the label associated with the meter.
   * @internal
   */
  setLabel(id: string): void;

  /**
   * Remove the id of the label associated with the meter.
   * @internal
   */
  removeLabel(id: string): void;
}

export const [NgpMeterStateToken, ngpMeter, injectMeterState, provideMeterState] = createPrimitive(
  'NgpMeter',
  ({
    value = signal(0),
    min = signal(0),
    max = signal(100),
    valueLabel = signal(
      (value, max, min) => `${max === min ? 0 : Math.round(((value - min) / (max - min)) * 100)}%`,
    ),
  }: NgpMeterProps): NgpMeterState => {
    const element = injectElementRef();

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

    function setLabel(id: string): void {
      labelId.set(id);
    }

    function removeLabel(id: string): void {
      // Only clear if this label is still the active one, so a newer label that has
      // taken over isn't clobbered when an old label is torn down.
      if (labelId() === id) {
        labelId.set(undefined);
      }
    }

    return {
      value,
      min,
      max,
      setLabel,
      removeLabel,
    } satisfies NgpMeterState;
  },
);
