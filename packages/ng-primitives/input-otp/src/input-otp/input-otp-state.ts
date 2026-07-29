import { computed, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { controlled, createPrimitive, emitter } from 'ng-primitives/state';
import { Observable } from 'rxjs';
import type { NgpInputOtpInputState } from '../input-otp-input/input-otp-input-state';
import type { NgpInputOtpSlotState } from '../input-otp-slot/input-otp-slot-state';
import type { NgpInputOtpInputMode } from './input-otp';

export interface NgpInputOtpProps {
  /**
   * The current value of the OTP.
   * @default ''
   */
  readonly value?: Signal<string>;

  /**
   * The regex pattern for allowed characters.
   * @default '[0-9]'
   */
  readonly pattern?: Signal<string>;

  /**
   * The input mode for the hidden input.
   * @default 'text'
   */
  readonly inputMode?: Signal<NgpInputOtpInputMode>;

  /**
   * Function to transform pasted text.
   */
  readonly pasteTransformer?: Signal<((text: string) => string) | undefined>;

  /**
   * Whether the input-otp is disabled.
   * @default false
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The placeholder character to display when a slot is empty.
   * @default ''
   */
  readonly placeholder?: Signal<string>;

  /**
   * Callback invoked when the value changes.
   */
  readonly onValueChange?: (value: string) => void;

  /**
   * Callback invoked when the OTP is complete (maxLength characters entered).
   */
  readonly onComplete?: (value: string) => void;
}

export interface NgpInputOtpState {
  /**
   * The current value of the OTP.
   */
  readonly value: Signal<string>;

  /**
   * The regex pattern for allowed characters.
   */
  readonly pattern: Signal<string>;

  /**
   * The input mode for the hidden input.
   */
  readonly inputMode: Signal<NgpInputOtpInputMode>;

  /**
   * Function to transform pasted text.
   */
  readonly pasteTransformer: Signal<((text: string) => string) | undefined>;

  /**
   * Whether the input-otp is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * The placeholder character to display when a slot is empty.
   */
  readonly placeholder: Signal<string>;

  /**
   * The number of characters in the OTP, derived from the registered slots.
   */
  readonly maxLength: Signal<number>;

  /**
   * The focus state of the input.
   * @internal
   */
  readonly isFocused: Signal<boolean>;

  /**
   * The selection start position.
   * @internal
   */
  readonly selectionStart: Signal<number>;

  /**
   * The selection end position.
   * @internal
   */
  readonly selectionEnd: Signal<number>;

  /**
   * Emits when the value state changes.
   */
  readonly valueChange: Observable<string>;

  /**
   * Emits when the complete state changes.
   */
  readonly complete: Observable<string>;

  /**
   * Register the hidden input with the input-otp.
   * @internal
   */
  registerInput(input: NgpInputOtpInputState): void;

  /**
   * Register a slot with the input-otp.
   * @internal
   */
  registerSlot(slot: NgpInputOtpSlotState): void;

  /**
   * Unregister a slot from the input-otp.
   * @internal
   */
  unregisterSlot(slot: NgpInputOtpSlotState): void;

  /**
   * Get the index of a registered slot.
   * @internal
   */
  getSlotIndex(slot: NgpInputOtpSlotState): number;

  /**
   * Update the value and emit change events.
   * @internal
   */
  updateValue(value: string): void;

  /**
   * Update the focus state.
   * @internal
   */
  updateFocus(focused: boolean): void;

  /**
   * Update the selection state.
   * @internal
   */
  updateSelection(start: number, end: number): void;

  /**
   * Focus the input and set the caret to the given position.
   * @internal
   */
  focusAtPosition(position: number): void;
}

export const [NgpInputOtpStateToken, ngpInputOtp, injectInputOtpState, provideInputOtpState] =
  createPrimitive(
    'NgpInputOtp',
    ({
      value: _value = signal(''),
      pattern = signal('[0-9]'),
      inputMode = signal<NgpInputOtpInputMode>('text'),
      pasteTransformer = signal<((text: string) => string) | undefined>(undefined),
      disabled = signal(false),
      placeholder = signal(''),
      onValueChange,
      onComplete,
    }: NgpInputOtpProps): NgpInputOtpState => {
      // The value is mutated internally as the user types, so it is controlled.
      const value = controlled(_value);
      const valueChange = emitter<string>();
      const complete = emitter<string>();

      // The registered hidden input and slots stay private to the factory — no other
      // part reads them directly, only the derived `maxLength` and the methods below.
      const inputElement = signal<NgpInputOtpInputState | undefined>(undefined);
      const slots = signal<NgpInputOtpSlotState[]>([]);

      const isFocused = signal(false);
      const selectionStart = signal(0);
      const selectionEnd = signal(0);

      // The number of characters in the OTP is derived from the registered slots.
      const maxLength = computed(() => slots().length);

      ngpInteractions({
        hover: true,
        press: true,
        focus: true,
        disabled: disabled,
      });

      function registerInput(input: NgpInputOtpInputState): void {
        inputElement.set(input);
      }

      function registerSlot(slot: NgpInputOtpSlotState): void {
        slots.update(current => [...current, slot]);
      }

      function unregisterSlot(slot: NgpInputOtpSlotState): void {
        slots.update(current => current.filter(s => s !== slot));
      }

      function getSlotIndex(slot: NgpInputOtpSlotState): number {
        return slots().indexOf(slot);
      }

      function updateValue(newValue: string): void {
        if (newValue === value()) {
          return;
        }

        value.set(newValue);
        onValueChange?.(newValue);
        valueChange.emit(newValue);

        // Emit complete once the OTP has been fully entered.
        if (newValue.length === maxLength()) {
          onComplete?.(newValue);
          complete.emit(newValue);
        }
      }

      function updateFocus(focused: boolean): void {
        isFocused.set(focused);
      }

      function updateSelection(start: number, end: number): void {
        selectionStart.set(start);
        selectionEnd.set(end);
      }

      function focusAtPosition(position: number): void {
        const input = inputElement();
        if (!input) {
          return;
        }

        input.focus();
        input.setSelectionRange(position, position);
      }

      return {
        value,
        pattern,
        inputMode,
        pasteTransformer,
        disabled,
        placeholder,
        maxLength,
        isFocused,
        selectionStart,
        selectionEnd,
        valueChange: valueChange.asObservable(),
        complete: complete.asObservable(),
        registerInput,
        registerSlot,
        unregisterSlot,
        getSlotIndex,
        updateValue,
        updateFocus,
        updateSelection,
        focusAtPosition,
      } satisfies NgpInputOtpState;
    },
  );
