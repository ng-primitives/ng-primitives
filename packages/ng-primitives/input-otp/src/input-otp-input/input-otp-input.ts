import { Directive } from '@angular/core';
import { ngpInputOtpInput } from './input-otp-input-state';

@Directive({
  selector: 'input[ngpInputOtpInput]',
  exportAs: 'ngpInputOtpInput',
})
export class NgpInputOtpInput {
  /**
   * The state of the input-otp input.
   */
  protected readonly state = ngpInputOtpInput();
}
