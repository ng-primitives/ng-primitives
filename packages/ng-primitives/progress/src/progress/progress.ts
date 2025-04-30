import { NumberInput } from '@angular/cdk/coercion';
import { Directive, computed, input, numberAttribute, signal } from '@angular/core';
import { NgpProgressLabel } from '../progress-label/progress-label';
import { progressState, provideProgressState } from './progress-state';

/**
 * Apply the `ngpProgress` directive to an element that represents the progress bar.
 */
@Directive({
  selector: '[ngpProgress]',
  providers: [provideProgressState()],
  host: {
    role: 'progressbar',
    '[attr.aria-valuemax]': 'state.max()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuenow]': 'state.value()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-labelledby]': 'label() ? label().id : null',
    '[attr.data-progressing]': 'progressing() ? "" : null',
    '[attr.data-indeterminate]': 'indeterminate() ? "" : null',
    '[attr.data-complete]': 'complete() ? "" : null',
  },
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
   * Determine if the progress is indeterminate.
   * @internal
   */
  readonly indeterminate = computed(() => this.state.value() === null);

  /**
   * Determine if the progress is in a progressing state.
   * @internal
   */
  readonly progressing = computed(
    () =>
      this.state.value() != null &&
      this.state.value()! > 0 &&
      this.state.value()! < this.state.max(),
  );

  /**
   * Determine if the progress is complete.
   * @internal
   */
  readonly complete = computed(() => this.state.value() === this.state.max());

  /**
   * Get the progress value text.
   */
  protected readonly valueText = computed(() => {
    const value = this.state.value();

    if (value == null) {
      return '';
    }

    return this.state.valueLabel()(value, this.state.max());
  });

  /**
   * The label associated with the progress bar.
   * @internal
   */
  readonly label = signal<NgpProgressLabel | null>(null);

  /**
   * The state of the progress bar.
   * @internal
   */
  protected readonly state = progressState<NgpProgress>(this);
}

export type NgpProgressValueTextFn = (value: number, max: number) => string;
