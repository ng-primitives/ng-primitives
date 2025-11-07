import { Directive, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { injectInputOtpState } from '../input-otp/input-otp-state';

@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
  host: {
    role: 'presentation',
    '(click)': 'handleClick($event)',
  },
})
export class NgpInputOtpSlot implements OnInit, OnDestroy {
  /**
   * Access the element reference.
   */
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  /**
   * The index of this slot.
   * @internal
   */
  private slotIndex = 0;

  constructor() {
    // Update the slot content and attributes when slot data changes
    effect(() => {
      this.updateSlot();
    });
  }

  ngOnInit(): void {
    // Register this slot with the parent and get an index
    this.slotIndex = this.state().registerSlot(this);
    this.updateSlot();
  }

  ngOnDestroy(): void {
    // Unregister this slot from the parent
    this.state().unregisterSlot(this.slotIndex);
  }

  /**
   * Update the slot content and attributes based on current state.
   * @internal
   */
  private updateSlot(): void {
    const slotData = this.state().slotData();
    const slot = slotData[this.slotIndex];
    const placeholder = this.state().placeholder();
    const element = this.elementRef.nativeElement;

    if (!slot) {
      return;
    }

    // Set the text content to either the character or the placeholder
    element.textContent = slot.char ?? placeholder;

    // Set data attributes
    element.setAttribute('data-slot-index', this.slotIndex.toString());

    // Clear existing state attributes
    element.removeAttribute('data-active');
    element.removeAttribute('data-filled');
    element.removeAttribute('data-caret');

    // Set current state attributes
    if (slot.focused) {
      element.setAttribute('data-active', '');
    }
    if (slot.filled) {
      element.setAttribute('data-filled', '');
    }
    if (slot.caret) {
      element.setAttribute('data-caret', '');
    }

    // Set cursor style
    element.style.cursor = this.state().disabled() ? 'default' : 'pointer';
  }

  /**
   * Handle click events on the slot.
   * @internal
   */
  handleClick(event: MouseEvent): void {
    if (this.state().disabled()) {
      return;
    }

    const currentValue = this.state().value();
    const maxLength = this.state().maxLength();

    // Focus the first empty slot, or the last slot if all are filled
    const targetPosition = currentValue.length < maxLength ? currentValue.length : maxLength - 1;
    this.state().focusAtPosition(targetPosition);

    event.preventDefault();
    event.stopPropagation();
  }
}
