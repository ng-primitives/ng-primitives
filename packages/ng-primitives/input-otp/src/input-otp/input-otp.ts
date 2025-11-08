import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import type { NgpInputOtpInput } from '../input-otp-input/input-otp-input';
import { inputOtpState, provideInputOtpState } from './input-otp-state';

export type NgpInputOtpInputMode =
  | 'numeric'
  | 'text'
  | 'decimal'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';

export interface NgpInputOtpSlotData {
  index: number;
  char: string | null;
  focused: boolean;
  caret: boolean;
  filled: boolean;
}

@Directive({
  selector: '[ngpInputOtp]',
  exportAs: 'ngpInputOtp',
  providers: [provideInputOtpState()],
})
export class NgpInputOtp {
  /**
   * Access the element reference.
   */
  readonly elementRef = injectElementRef<HTMLElement>();

  /**
   * The id of the input-otp.
   */
  readonly id = input(uniqueId('ngp-input-otp'));

  /**
   * The number of characters in the OTP.
   */
  readonly maxLength = input<number, NumberInput>(6, {
    alias: 'ngpInputOtpMaxLength',
    transform: numberAttribute,
  });

  /**
   * The current value of the OTP.
   */
  readonly value = input<string>('', {
    alias: 'ngpInputOtpValue',
  });

  /**
   * The regex pattern for allowed characters.
   */
  readonly pattern = input<string>(undefined, {
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
   * Store the input element reference.
   * @internal
   */
  readonly inputElement = signal<NgpInputOtpInput | undefined>(undefined);

  /**
   * The focus state of the input.
   * @internal
   */
  readonly isFocused = signal(false);

  /**
   * The selection start position.
   * @internal
   */
  readonly selectionStart = signal(0);

  /**
   * The selection end position.
   * @internal
   */
  readonly selectionEnd = signal(0);

  /**
   * Whether all slots are empty (for placeholder showing).
   */
  readonly isEmpty = computed(() => this.state.value().length === 0);

  /**
   * The computed slot data for rendering.
   */
  readonly slotData = computed<NgpInputOtpSlotData[]>(() => {
    const value = this.state.value();
    const maxLength = this.state.maxLength();
    const isFocused = this.isFocused();
    const selectionStart = this.selectionStart();
    const selectionEnd = this.selectionEnd();

    const slots: NgpInputOtpSlotData[] = [];
    for (let i = 0; i < maxLength; i++) {
      const char = i < value.length ? value[i] : null;
      // Show focus on the current cursor position, or last slot if filled and focused
      const focused =
        isFocused && (i === selectionStart || (value.length === maxLength && i === maxLength - 1));
      // Only show caret if there are empty slots and we're at the cursor position
      const caret =
        isFocused &&
        i === selectionStart &&
        selectionStart === selectionEnd &&
        value.length < maxLength;
      const filled = char !== null;

      slots.push({
        index: i,
        char,
        focused,
        caret,
        filled,
      });
    }

    return slots;
  });

  /**
   * The state of the input-otp.
   */
  protected readonly state = inputOtpState<NgpInputOtp>(this);

  constructor() {
    ngpInteractions({
      hover: true,
      press: true,
      focus: true,
      disabled: this.state.disabled,
    });
  }

  /**
   * Register an input element with the input-otp.
   * @param input The input element to register.
   * @internal
   */
  registerInput(input: NgpInputOtpInput): void {
    this.inputElement.set(input);
  }

  /**
   * Update the value and emit change events.
   * @param newValue The new value.
   * @internal
   */
  updateValue(newValue: string): void {
    if (newValue === this.state.value()) {
      return;
    }

    this.state.value.set(newValue);
    this.valueChange.emit(newValue);

    // Emit complete event when the OTP is complete
    if (newValue.length === this.state.maxLength()) {
      this.complete.emit(newValue);
    }
  }

  /**
   * Update focus state.
   * @param focused Whether the input is focused.
   * @internal
   */
  updateFocus(focused: boolean): void {
    this.isFocused.set(focused);
  }

  /**
   * Update selection state.
   * @param start Selection start position.
   * @param end Selection end position.
   * @internal
   */
  updateSelection(start: number, end: number): void {
    this.selectionStart.set(start);
    this.selectionEnd.set(end);
  }

  /**
   * Focus the input and set caret to the specified position.
   * @param position The position to set the caret to.
   * @internal
   */
  focusAtPosition(position: number): void {
    const input = this.inputElement();
    if (!input) {
      return;
    }

    input.focus();
    input.setSelectionRange(position, position);
  }
}
