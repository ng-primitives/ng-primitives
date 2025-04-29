import { NumberInput } from '@angular/cdk/coercion';
import { computed, Directive, input, numberAttribute, signal } from '@angular/core';
import type { NgpMeterLabel } from '../meter-label/meter-label';
import { meterState, provideMeterState } from './meter-state';

@Directive({
  selector: '[ngpMeter]',
  exportAs: 'ngpMeter',
  providers: [provideMeterState()],
  host: {
    role: 'meter',
    '[attr.aria-valuenow]': 'percentage()',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuetext]': 'valueLabel()',
    '[attr.aria-labelledby]': 'label()?.id()',
  },
})
export class NgpMeter {
  /** The value of the meter. */
  readonly value = input<number, NumberInput>(0, {
    alias: 'ngpMeterValue',
    transform: numberAttribute,
  });

  /** The minimum value of the meter. */
  readonly min = input<number, NumberInput>(0, {
    alias: 'ngpMeterMin',
    transform: numberAttribute,
  });

  /** The maximum value of the meter. */
  readonly max = input<number, NumberInput>(100, {
    alias: 'ngpMeterMax',
    transform: numberAttribute,
  });

  /**
   * Define a function that returns the meter value label.
   * @param value The current value
   * @param max The maximum value
   * @returns The value label
   */
  readonly valueLabel = input<NgpMeterValueTextFn>(
    (value, max) => `${Math.round((value / max) * 100)}%`,
    {
      alias: 'ngpMeterValueLabel',
    },
  );

  /** @internal Store the label instance */
  readonly label = signal<NgpMeterLabel | null>(null);

  /** @internal The percentage of the meter. */
  readonly percentage = computed(() => {
    const value = this.state.value();
    const min = this.state.min();
    const max = this.state.max();

    if (value == null) {
      return 0;
    }

    if (value < min) {
      return 0;
    }

    if (value > max) {
      return 100;
    }

    return ((value - min) / (max - min)) * 100;
  });

  /** The state of the meter. */
  private readonly state = meterState<NgpMeter>(this);
}

export type NgpMeterValueTextFn = (value: number, max: number) => string;
