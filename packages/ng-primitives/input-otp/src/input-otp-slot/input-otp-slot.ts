import {
  computed,
  Directive,
  effect,
  input,
  numberAttribute,
  OnInit,
} from '@angular/core';
import { NumberInput } from '@angular/cdk/coercion';
import { injectElementRef } from 'ng-primitives/internal';
import { injectInputOtpState } from '../input-otp/input-otp-state';


@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
  host: {
    '[attr.data-slot-index]': 'index()',
    '[attr.data-active]': 'slotData()?.focused ? "" : null',
    '[attr.data-filled]': 'slotData()?.filled ? "" : null',
    '[attr.data-caret]': 'slotData()?.caret ? "" : null',
    '[attr.data-placeholder]': 'showPlaceholder() ? "" : null',
    '[attr.role]': '"presentation"',
    '(click)': 'onClick($event)',
  },
})
export class NgpInputOtpSlot implements OnInit {
  /**
   * The index of this slot.
   */
  readonly index = input.required<number, NumberInput>({
    transform: numberAttribute,
  });

  /**
   * Access the element reference.
   */
  private readonly elementRef = injectElementRef<HTMLElement>();

  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  /**
   * The slot data for this specific slot.
   */
  readonly slotData = computed(() => {
    const slots = this.state().slotData();
    return slots.find(slot => slot.index === this.index()) || null;
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
    // Update the slot content when slot data changes
    effect(() => {
      this.updateSlotContent();
    });
  }

  ngOnInit(): void {
    this.updateSlotContent();
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
    const targetPosition =
      currentValue.length < maxLength ? currentValue.length : maxLength - 1;
    this.state().focusAtPosition(targetPosition);
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Update the slot content with the current character or placeholder.
   * @internal
   */
  private updateSlotContent(): void {
    const element = this.elementRef.nativeElement;
    const displayChar = this.displayChar();

    // Update the text content of the element
    element.textContent = displayChar;
  }
}
