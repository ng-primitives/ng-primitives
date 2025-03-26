/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, Directive } from '@angular/core';
import { injectDatePickerState } from '../date-picker/date-picker-state';
import { NgpDatePickerGridToken } from './date-picker-grid-token';

@Directive({
  selector: '[ngpDatePickerGrid]',
  exportAs: 'ngpDatePickerGrid',
  providers: [{ provide: NgpDatePickerGridToken, useExisting: NgpDatePickerGrid }],
  host: {
    role: 'grid',
    '[attr.aria-labelledby]': 'labelId()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpDatePickerGrid<T> {
  /**
   * Access the date picker state.
   */
  protected readonly state = injectDatePickerState<T>();

  /**
   * Determine the id for the label.
   */
  protected readonly labelId = computed(() => this.state().label()?.id());
}
