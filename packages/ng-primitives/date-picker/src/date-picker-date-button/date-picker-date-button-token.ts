/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerDateButton } from './date-picker-date-button';

export const NgpDatePickerDateButtonToken = new InjectionToken<NgpDatePickerDateButton<unknown>>(
  'NgpDatePickerDateButtonToken',
);

/**
 * Inject the DatePickerDateButton directive instance
 */
export function injectDatePickerDateButton<T>(): NgpDatePickerDateButton<T> {
  return inject(NgpDatePickerDateButtonToken) as NgpDatePickerDateButton<T>;
}
