import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDatePickerLabel, provideDatePickerLabelState } from './date-picker-label-state';
import { NgpDatePickerLabelToken } from './date-picker-label-token';

/**
 * The label that displays the current month and year typically in the header of the date picker. This will be announced by screen readers when the date changes.
 */
@Directive({
  selector: '[ngpDatePickerLabel]',
  exportAs: 'ngpDatePickerLabel',
  providers: [
    provideDatePickerLabelState(),
    { provide: NgpDatePickerLabelToken, useExisting: NgpDatePickerLabel },
  ],
})
export class NgpDatePickerLabel<T> {
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

  /**
   * The date picker label state.
   */
  protected readonly state = ngpDatePickerLabel<T>({
    id: this.id,
    ariaLive: this.ariaLive,
  });
}
