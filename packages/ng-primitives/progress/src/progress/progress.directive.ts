/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { NumberInput } from '@angular/cdk/coercion';
import { Directive, computed, input, numberAttribute } from '@angular/core';
import { controlState, provideControlState } from 'ng-primitives/forms';
import { NgpProgressToken } from './progress.token';

@Directive({
  selector: '[ngpProgress]',
  standalone: true,
  providers: [{ provide: NgpProgressToken, useExisting: NgpProgress }, provideControlState()],
  host: {
    role: 'progressbar',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuenow]': 'state.value()',
    '[attr.aria-valuetext]': 'label()',
    '[attr.data-state]': 'dataState()',
    '[attr.data-value]': 'state.value()',
    '[attr.data-max]': 'max()',
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
  );

  /**
   * Get the state of the progress bar.
   * @returns 'indeterminate' | 'loading' | 'complete'
   * @internal
   */
  protected readonly dataState = computed(() =>
    this.value() == null ? 'indeterminate' : this.value() === this.max() ? 'complete' : 'loading',
  );

  /**
   * Get the progress value label.
   */
  protected readonly label = computed(() => this.valueLabel()(this.value(), this.max()));

  /**
   * The form control state. This is used to allow communication between the progress and the control value access and any
   * components that use this as a host directive.
   * @internal
   */
  readonly state = controlState({
    value: this.value,
  });
}

export type NgpProgressValueLabelFn = (value: number, max: number) => string;
