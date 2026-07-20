import { Directive } from '@angular/core';
import { NgpVisuallyHidden } from 'ng-primitives/a11y';
import { ngpInputOtpInput } from './input-otp-input-state';

@Directive({
  selector: 'input[ngpInputOtpInput]',
  exportAs: 'ngpInputOtpInput',
  hostDirectives: [NgpVisuallyHidden],
})
export class NgpInputOtpInput {
  /**
   * The state of the input-otp input.
   */
  protected readonly state = ngpInputOtpInput();
}
