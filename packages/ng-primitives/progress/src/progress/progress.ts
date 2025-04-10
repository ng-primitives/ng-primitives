import { NumberInput } from '@angular/cdk/coercion';
import { Directive, computed, input, numberAttribute } from '@angular/core';
import { progressState, provideProgressState } from './progress-state';
import { provideProgress } from './progress-token';

@Directive({
  selector: '[ngpProgress]',
  providers: [provideProgress(NgpProgress), provideProgressState()],
  host: {
    role: 'progressbar',
    '[attr.aria-valuemax]': 'state.max()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuenow]': 'state.value()',
    '[attr.aria-valuetext]': 'label()',
    '[attr.data-state]': 'dataState()',
    '[attr.data-value]': 'state.value()',
    '[attr.data-max]': 'state.max()',
  },
})
export class NgpProgress {
  /**
   * Define the progress value.
   */
  readonly value = input<number, NumberInput>(0, {
    alias: 'ngpProgressValue',
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
  readonly valueLabel = input<NgpProgressValueLabelFn>(
    (value, max) => `${Math.round((value / max) * 100)}%`,
    {
      alias: 'ngpProgressValueLabel',
    },
  );

  /**
   * Get the state of the progress bar.
   * @returns 'indeterminate' | 'loading' | 'complete'
   * @internal
   */
  protected readonly dataState = computed(() =>
    this.state.value() == null
      ? 'indeterminate'
      : this.state.value() === this.state.max()
        ? 'complete'
        : 'loading',
  );

  /**
   * Get the progress value label.
   */
  protected readonly label = computed(() =>
    this.state.valueLabel()(this.state.value(), this.state.max()),
  );

  /**
   * The state of the progress bar.
   * @internal
   */
  protected readonly state = progressState<NgpProgress>(this);
}

export type NgpProgressValueLabelFn = (value: number, max: number) => string;
