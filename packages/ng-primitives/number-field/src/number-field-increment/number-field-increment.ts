import { Directive } from '@angular/core';
import {
  ngpNumberFieldIncrement,
  provideNumberFieldIncrementState,
} from './number-field-increment-state';

/**
 * Apply the `ngpNumberFieldIncrement` directive to a button element that increments the number field value.
 */
@Directive({
  selector: '[ngpNumberFieldIncrement]',
  exportAs: 'ngpNumberFieldIncrement',
  providers: [provideNumberFieldIncrementState()],
})
export class NgpNumberFieldIncrement {
  constructor() {
    ngpNumberFieldIncrement({});
  }
}
