import { computed, Directive, OnDestroy } from '@angular/core';
import { injectInputOtpState } from '../input-otp/input-otp-state';

@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
  host: {
    role: 'presentation',
    '[attr.data-slot-index]': 'index()',
    '[attr.data-active]': 'focused() ? "" : null',
    '[attr.data-filled]': 'filled() ? "" : null',
    '[attr.data-caret]': 'caret() ? "" : null',
    '[attr.data-placeholder]': 'showPlaceholder() ? "" : null',
    '[textContent]': 'displayChar()',
    '(click)': 'onClick($event)',
  },
})
export class NgpInputOtpSlot implements OnDestroy {
  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  /**
   * The computed index of this slot based on registration order.
   */
  readonly index = computed(() => this.state().getSlotIndex(this));

  /**
   * The character for this slot from the value string.
   */
  readonly char = computed(() => {
    const value = this.state().value();
    const currentIndex = this.index();
    return currentIndex >= 0 && currentIndex < value.length ? value[currentIndex] : null;
  });

  /**
   * Whether this slot is focused (active).
   */
  readonly focused = computed(() => {
    const currentIndex = this.index();
    const isFocused = this.state().isFocused();
    const selectionStart = this.state().selectionStart();
    const value = this.state().value();
    const maxLength = this.state().maxLength();

    return (
      isFocused &&
      (currentIndex === selectionStart ||
        (value.length === maxLength && currentIndex === maxLength - 1))
    );
  });

  /**
   * Whether this slot should show the caret.
   */
  readonly caret = computed(() => {
    const currentIndex = this.index();
    const isFocused = this.state().isFocused();
    const selectionStart = this.state().selectionStart();
    const selectionEnd = this.state().selectionEnd();
    const value = this.state().value();
    const maxLength = this.state().maxLength();

    return (
      isFocused &&
      currentIndex === selectionStart &&
      selectionStart === selectionEnd &&
      value.length < maxLength
    );
  });

  /**
   * Whether this slot is filled with a character.
   */
  readonly filled = computed(() => this.char() !== null);

  /**
   * Whether to show placeholder for this slot.
   */
  readonly showPlaceholder = computed(() => {
    const placeholder = this.state().placeholder();
    return !this.filled() && !!placeholder;
  });

  /**
   * The display character for this slot (character or placeholder).
   */
  readonly displayChar = computed(() => {
    const char = this.char();
    if (char) return char;
    if (this.showPlaceholder()) return this.state().placeholder();
    return '';
  });

  constructor() {
    this.state().registerSlot(this);
  }

  ngOnDestroy(): void {
    // Unregister this slot when destroyed
    this.state().unregisterSlot(this);
  }

  /**
   * Handle click events on the slot.
   * @internal
   */
  protected onClick(event: Event): void {
    if (this.state().disabled()) return;

    const currentValue = this.state().value();
    const maxLength = this.state().maxLength();

    // Focus the first empty slot, or the last slot if all are filled
    const targetPosition = currentValue.length < maxLength ? currentValue.length : maxLength - 1;
    this.state().focusAtPosition(targetPosition);
    event.preventDefault();
    event.stopPropagation();
  }
}
