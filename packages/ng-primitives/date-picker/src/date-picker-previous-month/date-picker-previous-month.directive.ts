/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpDatePickerPreviousMonthToken } from './date-picker-previous-month.token';

@Directive({
  standalone: true,
  selector: '[ngpDatePickerPreviousMonth]',
  exportAs: 'ngpDatePickerPreviousMonth',
  providers: [
    { provide: NgpDatePickerPreviousMonthToken, useExisting: NgpDatePickerPreviousMonth },
  ],
})
export class NgpDatePickerPreviousMonth {}
