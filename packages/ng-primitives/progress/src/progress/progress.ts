import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute, signal } from '@angular/core';
import {
  ngpProgressPattern,
  provideProgressPattern,
  type NgpProgressValueTextFn,
} from './progress-pattern';

/**
 * Apply the `ngpProgress` directive to an element that represents the progress bar.
 */
@Directive({
  selector: '[ngpProgress]',
  providers: [provideProgressPattern(NgpProgress, instance => instance.pattern)],
})
export class NgpProgress {
  /**
   * Define the progress value.
   */
  readonly value = input<number | null, NumberInput>(0, {
    alias: 'ngpProgressValue',
    transform: v => (v == null ? null : numberAttribute(v)),
  });

  /**
   * Define the progress min value.
   * @default '0'
   */
  readonly min = input<number, NumberInput>(0, {
    alias: 'ngpProgressMin',
    transform: numberAttribute,
  });

  /**
   * Define the progress max value.
   * @default 100
   */
  readonly max = input<number, NumberInput>(100, {
    alias: 'ngpProgressMax',
    transform: numberAttribute,
  });

  /**
   * Define a function that returns the progress value label.
   * @param value The current value
   * @param max The maximum value
   * @returns The value label
   */
  readonly valueLabel = input<NgpProgressValueTextFn>(
    (value, max) => `${Math.round((value / max) * 100)}%`,
    {
      alias: 'ngpProgressValueLabel',
    },
  );

  private readonly labelId = signal<string | null>(null);

  /**
   * The progress pattern.
   */
  readonly pattern = ngpProgressPattern({
    value: this.value,
    min: this.min,
    max: this.max,
    valueLabel: this.valueLabel,
    labelId: this.labelId,
  });

  /**
   * Register a progress label with the progress to provide accessibility.
   * @param id The id of the label element
   * @internal
   */
  setLabel(id: string | null) {
    this.labelId.set(id);
  }
}
