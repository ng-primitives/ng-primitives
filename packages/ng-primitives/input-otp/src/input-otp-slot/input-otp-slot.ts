import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import type { NgpInputOtpSlotData } from '../input-otp/input-otp';
import { injectInputOtpState } from '../input-otp/input-otp-state';

/**
 * Template context for the input OTP slot directive.
 */
export interface NgpInputOtpSlotContext {
  /**
   * The slot data (implicit context).
   */
  $implicit: NgpInputOtpSlotData;

  /**
   * The slot index.
   */
  index: number;

  /**
   * The character in this slot (null if empty).
   */
  char: string | null;

  /**
   * Whether this slot is currently active (has focus).
   */
  focused: boolean;

  /**
   * Whether this slot should show a fake caret.
   */
  caret: boolean;

  /**
   * Whether this slot is filled with a character.
   */
  filled: boolean;
}

@Directive({
  selector: '[ngpInputOtpSlot]',
  exportAs: 'ngpInputOtpSlot',
})
export class NgpInputOtpSlot implements OnInit, OnDestroy {
  /**
   * Access the template reference.
   */
  private readonly templateRef = inject(TemplateRef<NgpInputOtpSlotContext>);

  /**
   * Access the view container reference.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  /**
   * Map of embedded views by slot index.
   */
  private embeddedViews = new Map<number, EmbeddedViewRef<NgpInputOtpSlotContext>>();

  constructor() {
    // Update existing embedded view contexts when slot data changes
    effect(() => {
      // Only update if we have rendered views
      if (this.embeddedViews.size > 0) {
        this.updateSlotContexts();
      }
    });
  }

  ngOnInit(): void {
    // Register this template with the parent and immediately render all slots
    this.renderAllSlots();
  }

  ngOnDestroy(): void {
    // Clean up all embedded views
    this.embeddedViews.forEach(view => view.destroy());
    this.embeddedViews.clear();
  }

  /**
   * Render slots for all indices based on maxLength.
   * @internal
   */
  private renderAllSlots(): void {
    const maxLength = this.state().maxLength();
    const slotData = this.state().slotData();

    // Create embedded view for each slot
    for (let i = 0; i < maxLength; i++) {
      const slot = slotData.find(s => s.index === i);
      if (slot) {
        this.createSlotView(slot);
      }
    }
  }

  /**
   * Create an embedded view for a specific slot.
   * @internal
   */
  private createSlotView(slotData: NgpInputOtpSlotData): void {
    const context: NgpInputOtpSlotContext = {
      $implicit: slotData,
      index: slotData.index,
      char: slotData.char,
      focused: slotData.focused,
      caret: slotData.caret,
      filled: slotData.filled,
    };

    const embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, context);

    // Add click handler to the root element
    const rootElement = embeddedView.rootNodes[0] as HTMLElement;
    if (rootElement) {
      // Set data attributes for styling
      rootElement.setAttribute('data-slot-index', slotData.index.toString());
      rootElement.setAttribute('role', 'presentation');

      if (slotData.focused) rootElement.setAttribute('data-active', '');
      if (slotData.filled) rootElement.setAttribute('data-filled', '');
      if (slotData.caret) rootElement.setAttribute('data-caret', '');

      rootElement.style.cursor = this.state().disabled() ? 'default' : 'pointer';

      // Add click handler
      rootElement.addEventListener('click', event => {
        if (this.state().disabled()) return;

        const currentValue = this.state().value();
        const maxLength = this.state().maxLength();

        // Focus the first empty slot, or the last slot if all are filled
        const targetPosition =
          currentValue.length < maxLength ? currentValue.length : maxLength - 1;
        this.state().focusAtPosition(targetPosition);
        event.preventDefault();
        event.stopPropagation();
      });
    }

    this.embeddedViews.set(slotData.index, embeddedView);
  }

  /**
   * Update the context of existing embedded views with current slot data.
   * @internal
   */
  private updateSlotContexts(): void {
    const slotData = this.state().slotData();

    slotData.forEach(slot => {
      const embeddedView = this.embeddedViews.get(slot.index);
      if (embeddedView) {
        // Update the existing context
        const context = embeddedView.context;
        context.$implicit = slot;
        context.char = slot.char;
        context.focused = slot.focused;
        context.caret = slot.caret;
        context.filled = slot.filled;

        // Update data attributes on the root element
        const rootElement = embeddedView.rootNodes[0] as HTMLElement;
        if (rootElement) {
          // Clear existing data attributes
          rootElement.removeAttribute('data-active');
          rootElement.removeAttribute('data-filled');
          rootElement.removeAttribute('data-caret');

          // Set current data attributes
          if (slot.focused) rootElement.setAttribute('data-active', '');
          if (slot.filled) rootElement.setAttribute('data-filled', '');
          if (slot.caret) rootElement.setAttribute('data-caret', '');
        }

        // Mark the view for check to trigger change detection
        embeddedView.markForCheck();
      }
    });
  }
}
