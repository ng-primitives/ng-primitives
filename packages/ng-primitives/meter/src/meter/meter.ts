import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { ngpMeter, provideMeterState } from './meter-state';

@Directive({
  selector: '[ngpMeter]',
  exportAs: 'ngpMeter',
  providers: [provideMeterState()],
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
   * @param min The minimum value
   * @returns The value label
   */
  readonly valueLabel = input<NgpMeterValueTextFn>(
    (value, max, min) => `${max === min ? 0 : Math.round(((value - min) / (max - min)) * 100)}%`,
    {
      alias: 'ngpMeterValueLabel',
    },
  );

  /**
   * The state of the meter.
   * @internal
   */
  private readonly state = ngpMeter({
    value: this.value,
    min: this.min,
    max: this.max,
    valueLabel: this.valueLabel,
  });
}

export type NgpMeterValueTextFn = (value: number, max: number, min: number) => string;
