/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpDatePickerLabel } from './date-picker-label.directive';

export const NgpDatePickerLabelToken = new InjectionToken<NgpDatePickerLabel>(
  'NgpDatePickerLabelToken',
);

/**
 * Inject the DatePickerLabel directive instance
 */
export function injectDatePickerLabel(): NgpDatePickerLabel {
  return inject(NgpDatePickerLabelToken);
}
