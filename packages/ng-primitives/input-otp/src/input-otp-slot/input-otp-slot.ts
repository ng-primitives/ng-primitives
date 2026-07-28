import { Directive } from '@angular/core';
import { ngpInputOtpSlot } from './input-otp-slot-state';

@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
})
export class NgpInputOtpSlot {
  /**
   * The state of the input-otp slot.
   */
  protected readonly state = ngpInputOtpSlot();
}
