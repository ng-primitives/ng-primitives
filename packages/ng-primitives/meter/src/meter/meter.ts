import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute, signal } from '@angular/core';
import { ngpMeterPattern, provideMeterPattern } from './meter-pattern';
import { provideMeter } from './meter-token';

@Directive({
  selector: '[ngpMeter]',
  exportAs: 'ngpMeter',
  providers: [provideMeter(NgpMeter), provideMeterPattern(NgpMeter, instance => instance.pattern)],
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
  readonly label = signal<string | null>(null);

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpMeterPattern({
    value: this.value,
    min: this.min,
    max: this.max,
    valueLabel: this.valueLabel,
    label: this.label,
  });
}

export type NgpMeterValueTextFn = (value: number, max: number) => string;
