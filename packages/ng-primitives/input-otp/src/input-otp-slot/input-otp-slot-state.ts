import { computed, effect } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { injectInputOtpState } from '../input-otp/input-otp-state';

export interface NgpInputOtpSlotState {}

export const [NgpInputOtpSlotStateToken, ngpInputOtpSlot] = createPrimitive(
  'NgpInputOtpSlot',
  (): NgpInputOtpSlotState => {
    const element = injectElementRef<HTMLElement>();
    const otpState = injectInputOtpState();

    // Identity token for this slot. The parent orders slots by registration order,
    // so a stable per-slot reference is all it needs.
    const state: NgpInputOtpSlotState = {};

    // The index of this slot based on registration order.
    const index = computed(() => otpState().getSlotIndex(state));

    // The character for this slot from the value string.
    const char = computed(() => {
      const value = otpState().value();
      const currentIndex = index();
      return currentIndex >= 0 && currentIndex < value.length ? value[currentIndex] : null;
    });

    // Whether this slot is focused (active).
    const focused = computed(() => {
      const currentIndex = index();
      const isFocused = otpState().isFocused();
      const selectionStart = otpState().selectionStart();
      const value = otpState().value();
      const maxLength = otpState().maxLength();

      return (
        isFocused &&
        (currentIndex === selectionStart ||
          (value.length === maxLength && currentIndex === maxLength - 1))
      );
    });

    // Whether this slot should show the caret.
    const caret = computed(() => {
      const currentIndex = index();
      const isFocused = otpState().isFocused();
      const selectionStart = otpState().selectionStart();
      const selectionEnd = otpState().selectionEnd();
      const value = otpState().value();
      const maxLength = otpState().maxLength();

      return (
        isFocused &&
        currentIndex === selectionStart &&
        selectionStart === selectionEnd &&
        value.length < maxLength
      );
    });

    // Whether this slot is filled with a character.
    const filled = computed(() => char() !== null);

    // Whether to show the placeholder for this slot.
    const showPlaceholder = computed(() => {
      const placeholder = otpState().placeholder();
      return !filled() && !!placeholder;
    });

    // The display character for this slot (character or placeholder).
    const displayChar = computed(() => {
      const character = char();
      if (character) {
        return character;
      }
      if (showPlaceholder()) {
        return otpState().placeholder();
      }
      return '';
    });

    // Attribute & data bindings
    attrBinding(element, 'role', 'presentation');
    attrBinding(element, 'data-slot-index', index);
    dataBinding(element, 'data-active', () => (focused() ? '' : null));
    dataBinding(element, 'data-filled', () => (filled() ? '' : null));
    dataBinding(element, 'data-caret', () => (caret() ? '' : null));
    dataBinding(element, 'data-placeholder', () => (showPlaceholder() ? '' : null));

    // `textContent` is a DOM property, not an attribute, so there is no binding
    // helper for it — write it reactively.
    effect(() => {
      element.nativeElement.textContent = displayChar();
    });

    // Event listeners
    listener(element, 'click', event => onClick(event));

    function onClick(event: Event): void {
      if (otpState().disabled()) {
        return;
      }

      const currentValue = otpState().value();
      const maxLength = otpState().maxLength();

      // Focus the first empty slot, or the last slot if all are filled.
      const targetPosition = currentValue.length < maxLength ? currentValue.length : maxLength - 1;
      otpState().focusAtPosition(targetPosition);
      event.preventDefault();
      event.stopPropagation();
    }

    // Register with the parent and deregister on teardown so the slot count and
    // ordering stay accurate as slots are added or removed.
    otpState().registerSlot(state);
    onDestroy(() => otpState().unregisterSlot(state));

    return state;
  },
);
