import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpInputOtp, provideInputOtpState } from './input-otp-state';

export type NgpInputOtpInputMode =
  | 'numeric'
  | 'text'
  | 'decimal'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';

@Directive({
  selector: '[ngpInputOtp]',
  exportAs: 'ngpInputOtp',
  providers: [provideInputOtpState()],
})
export class NgpInputOtp {
  /**
   * The id of the input-otp.
   */
  readonly id = input(uniqueId('ngp-input-otp'));

  /**
   * The current value of the OTP. A null/undefined value (e.g. from a form
   * `writeValue(null)` or `reset()`) is coerced to an empty string.
   */
  readonly value = input<string, string | null | undefined>('', {
    alias: 'ngpInputOtpValue',
    transform: value => value ?? '',
  });

  /**
   * The regex pattern for allowed characters.
   */
  readonly pattern = input<string>('[0-9]', {
    alias: 'ngpInputOtpPattern',
  });

  /**
   * The input mode for the hidden input.
   */
  readonly inputMode = input<NgpInputOtpInputMode>('text', {
    alias: 'ngpInputOtpInputMode',
  });

  /**
   * Function to transform pasted text.
   */
  readonly pasteTransformer = input<(text: string) => string>(undefined, {
    alias: 'ngpInputOtpPasteTransformer',
  });

  /**
   * Whether the input-otp is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpInputOtpDisabled',
    transform: booleanAttribute,
  });

  /**
   * The placeholder character to display when a slot is empty.
   */
  readonly placeholder = input<string>('', {
    alias: 'ngpInputOtpPlaceholder',
  });

  /**
   * Event emitted when the value changes.
   */
  readonly valueChange = output<string>({
    alias: 'ngpInputOtpValueChange',
  });

  /**
   * Event emitted when the OTP is complete (maxLength characters entered).
   */
  readonly complete = output<string>({
    alias: 'ngpInputOtpComplete',
  });

  /**
   * The state of the input-otp.
   */
  private readonly state = ngpInputOtp({
    value: this.value,
    pattern: this.pattern,
    inputMode: this.inputMode,
    pasteTransformer: this.pasteTransformer,
    disabled: this.disabled,
    placeholder: this.placeholder,
    onValueChange: value => this.valueChange.emit(value),
    onComplete: value => this.complete.emit(value),
  });
}
