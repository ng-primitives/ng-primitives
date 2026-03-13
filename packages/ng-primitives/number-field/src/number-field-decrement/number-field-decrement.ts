import { Directive } from '@angular/core';
import {
  ngpNumberFieldDecrement,
  provideNumberFieldDecrementState,
} from './number-field-decrement-state';

/**
 * Apply the `ngpNumberFieldDecrement` directive to a button element that decrements the number field value.
 */
@Directive({
  selector: '[ngpNumberFieldDecrement]',
  exportAs: 'ngpNumberFieldDecrement',
  providers: [provideNumberFieldDecrementState()],
})
export class NgpNumberFieldDecrement {
  constructor() {
    ngpNumberFieldDecrement({});
  }
}
