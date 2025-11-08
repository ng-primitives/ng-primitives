import { computed, Directive, OnDestroy } from '@angular/core';
import { injectInputOtpState } from '../input-otp/input-otp-state';

@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
  host: {
    role: 'presentation',
    '[attr.data-slot-index]': 'index()',
    '[attr.data-active]': 'slotData()?.focused ? "" : null',
    '[attr.data-filled]': 'slotData()?.filled ? "" : null',
    '[attr.data-caret]': 'slotData()?.caret ? "" : null',
    '[attr.data-placeholder]': 'showPlaceholder() ? "" : null',
    '[textContent]': 'displayChar()',
    '(click)': 'onClick($event)',
  },
})
export class NgpInputOtpSlot implements OnDestroy {
  /**
   * The computed index of this slot based on registration order.
   */
  readonly index = computed(() => this.state().getSlotIndex(this));

  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  /**
   * The slot data for this specific slot.
   */
  readonly slotData = computed(() => {
    const slots = this.state().slotData();
    const currentIndex = this.index();
    return currentIndex >= 0 ? slots[currentIndex] || null : null;
  });

  /**
   * Whether to show placeholder for this slot.
   */
  readonly showPlaceholder = computed(() => {
    const slot = this.slotData();
    const placeholder = this.state().placeholder();
    return slot && !slot.filled && placeholder;
  });

  /**
   * The display character for this slot (character or placeholder).
   */
  readonly displayChar = computed(() => {
    const slot = this.slotData();
    if (!slot) return '';
    if (slot.char) return slot.char;
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
