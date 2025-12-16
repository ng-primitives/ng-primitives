import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpProgress, provideProgressState } from './progress-state';

/**
 * Apply the `ngpProgress` directive to an element that represents the progress bar.
 */
@Directive({
  selector: '[ngpProgress]',
  providers: [provideProgressState()],
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

  /**
   * The unique identifier for the progress.
   */
  readonly id = input<string>(uniqueId('ngp-progress'));

  /**
   * The state of the progress bar.
   * @internal
   */
  private readonly state = ngpProgress({
    value: this.value,
    min: this.min,
    max: this.max,
    valueLabel: this.valueLabel,
    id: this.id,
  });

  /**
   * Get the progress value text.
   */
  protected readonly valueText = this.state.valueText;
}

export type NgpProgressValueTextFn = (value: number, max: number) => string;
