import { Component } from '@angular/core';
import { InputOtp } from './input-otp';

@Component({
  selector: 'app-input-otp-example',
  imports: [InputOtp],
  template: '<app-input-otp ariaLabel="One-time password" />',
})
export default class App {}
