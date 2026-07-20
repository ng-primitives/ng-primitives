import { afterRenderEffect } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { injectInputOtpState } from '../input-otp/input-otp-state';

export interface NgpInputOtpInputState {
  /**
   * Focus the input.
   * @internal
   */
  focus(): void;

  /**
   * Set the selection range on the input.
   * @internal
   */
  setSelectionRange(start: number, end: number): void;
}

export const [NgpInputOtpInputStateToken, ngpInputOtpInput] = createPrimitive(
  'NgpInputOtpInput',
  (): NgpInputOtpInputState => {
    const elementRef = injectElementRef<HTMLInputElement>();
    const otpState = injectInputOtpState();

    // Attribute bindings
    attrBinding(elementRef, 'autocomplete', 'one-time-code');
    attrBinding(elementRef, 'inputmode', () => otpState().inputMode());
    attrBinding(elementRef, 'maxlength', () => otpState().maxLength());
    attrBinding(elementRef, 'pattern', () => otpState().pattern() || null);
    attrBinding(elementRef, 'disabled', () => (otpState().disabled() ? '' : null));

    // Event listeners
    listener(elementRef, 'input', event => onInput(event));
    listener(elementRef, 'paste', event => onPaste(event));
    listener(elementRef, 'focus', () => onFocus());
    listener(elementRef, 'blur', () => otpState().updateFocus(false));
    listener(elementRef, 'keyup', () => updateSelection());
    listener(elementRef, 'select', () => updateSelection());

    // Keep the hidden input's value in sync with the state, including programmatic
    // changes (e.g. a form writeValue) which don't fire `input`. Guarded so it never
    // rewrites the value the user is actively typing (which would reset the caret) —
    // during typing the state and the element already agree.
    afterRenderEffect(() => {
      const value = otpState().value();
      if (elementRef.nativeElement.value !== value) {
        elementRef.nativeElement.value = value;
      }
    });

    function focus(): void {
      elementRef.nativeElement.focus();
    }

    function setSelectionRange(start: number, end: number): void {
      elementRef.nativeElement.setSelectionRange(start, end);
    }

    function onInput(event: Event): void {
      if (otpState().disabled()) {
        return;
      }

      const input = event.target as HTMLInputElement;
      let newValue = input.value;

      // Validate against the pattern if provided.
      const pattern = otpState().pattern();
      if (pattern) {
        const patternRegex = new RegExp(pattern);
        const filteredValue = newValue
          .split('')
          .filter(char => patternRegex.test(char))
          .join('');

        if (filteredValue !== newValue) {
          newValue = filteredValue;
          input.value = newValue;
        }
      }

      // Clamp to maxLength.
      const maxLength = otpState().maxLength();
      if (newValue.length > maxLength) {
        newValue = newValue.substring(0, maxLength);
        input.value = newValue;
      }

      otpState().updateValue(newValue);
      updateSelection();
    }

    function onPaste(event: ClipboardEvent): void {
      if (otpState().disabled()) {
        return;
      }

      event.preventDefault();

      const clipboardData = event.clipboardData?.getData('text') || '';
      let pastedText = clipboardData.trim();

      // Apply the paste transformer if provided.
      const transformer = otpState().pasteTransformer();
      if (transformer) {
        pastedText = transformer(pastedText);
      }

      // Validate against the pattern if provided.
      const pattern = otpState().pattern();
      if (pattern) {
        const patternRegex = new RegExp(pattern);
        pastedText = pastedText
          .split('')
          .filter(char => patternRegex.test(char))
          .join('');
      }

      // Clamp to maxLength.
      const maxLength = otpState().maxLength();
      if (pastedText.length > maxLength) {
        pastedText = pastedText.substring(0, maxLength);
      }

      // Update the input value and the state.
      elementRef.nativeElement.value = pastedText;
      otpState().updateValue(pastedText);

      // Set the caret to the end.
      const endPosition = pastedText.length;
      setSelectionRange(endPosition, endPosition);
      updateSelection();
    }

    function onFocus(): void {
      otpState().updateFocus(true);
      updateSelection();
    }

    function updateSelection(): void {
      const input = elementRef.nativeElement;
      const maxLength = otpState().maxLength();

      // If the input is at max length, keep the selection on the last character.
      if (input.value.length === maxLength) {
        input.setSelectionRange(input.value.length - 1, input.value.length);
      }

      // If the input is below max length, keep the caret at the end.
      if (input.value.length < maxLength) {
        input.setSelectionRange(input.value.length, input.value.length);
      }

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      otpState().updateSelection(start, end);
    }

    const state: NgpInputOtpInputState = {
      focus,
      setSelectionRange,
    };

    // Register the hidden input so the parent can drive focus/caret imperatively.
    otpState().registerInput(state);

    return state;
  },
);
