import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectDatePickerState } from '../date-picker/date-picker-state';
import { NgpDatePickerLabelToken } from './date-picker-label-token';

@Directive({
  selector: '[ngpDatePickerLabel]',
  exportAs: 'ngpDatePickerLabel',
  providers: [{ provide: NgpDatePickerLabelToken, useExisting: NgpDatePickerLabel }],
  host: {
    '[id]': 'id()',
    '[attr.aria-live]': 'ariaLive()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpDatePickerLabel<T> {
  /**
   * Access the date picker.
   */
  protected readonly state = injectDatePickerState<T>();

  /**
   * Define a unique id for the label.
   */
  readonly id = input(uniqueId('ngp-date-picker-label'));

  /**
   * Define the aria live attribute.
   */
  readonly ariaLive = input('polite', {
    alias: 'aria-live',
  });
}
