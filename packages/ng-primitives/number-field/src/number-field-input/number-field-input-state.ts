import { DOCUMENT } from '@angular/common';
import { computed, inject, Signal, signal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectNumberFieldState } from '../number-field/number-field-state';

/**
 * Public state surface for the NumberField Input primitive.
 */
export interface NgpNumberFieldInputState {
  /**
   * Focus the input element.
   */
  focus(): void;
}

/**
 * Inputs for configuring the NumberField Input primitive.
 */
export interface NgpNumberFieldInputProps {
  /**
   * Whether mouse wheel changes the value.
   */
  readonly allowWheelScrub?: Signal<boolean>;
}

export const [
  NgpNumberFieldInputStateToken,
  ngpNumberFieldInput,
  injectNumberFieldInputState,
  provideNumberFieldInputState,
] = createPrimitive(
  'NgpNumberFieldInput',
  ({ allowWheelScrub = signal(false) }: NgpNumberFieldInputProps): NgpNumberFieldInputState => {
    const elementRef = injectElementRef<HTMLInputElement>();
    const numberField = injectNumberFieldState();
    const document = inject(DOCUMENT);

    // Form control integration — sets id, aria-labelledby, aria-describedby on the input
    ngpFormControl({ id: numberField().id, disabled: numberField().disabled });

    const tabindex = computed(() => (numberField().disabled() ? -1 : 0));

    // Host bindings
    const inputMode = computed(() => {
      const minVal = numberField().min();
      const stepVal = numberField().step();
      const allowsNegative = !isFinite(minVal) || minVal < 0;
      const hasDecimals = stepVal % 1 !== 0;

      // Some mobile keyboards can't show both minus sign and decimal point
      if (allowsNegative && hasDecimals) return 'text';
      if (hasDecimals) return 'decimal';
      if (!allowsNegative) return 'numeric';
      return 'text';
    });

    attrBinding(elementRef, 'role', 'spinbutton');
    attrBinding(elementRef, 'type', 'text');
    attrBinding(elementRef, 'inputmode', inputMode);
    attrBinding(elementRef, 'autocomplete', 'off');
    attrBinding(elementRef, 'autocorrect', 'off');
    attrBinding(elementRef, 'spellcheck', 'false');
    attrBinding(elementRef, 'aria-roledescription', 'Number field');
    attrBinding(elementRef, 'aria-valuemin', () => {
      const min = numberField().min();
      return isFinite(min) ? min.toString() : null;
    });
    attrBinding(elementRef, 'aria-valuemax', () => {
      const max = numberField().max();
      return isFinite(max) ? max.toString() : null;
    });
    attrBinding(elementRef, 'aria-valuenow', () => numberField().value()?.toString() ?? null);
    attrBinding(elementRef, 'tabindex', () => tabindex().toString());
    attrBinding(elementRef, 'readonly', () => (numberField().readonly() ? '' : null));
    dataBinding(elementRef, 'data-readonly', () => numberField().readonly());

    ngpInteractions({
      hover: true,
      focusVisible: true,
      disabled: numberField().disabled,
    });

    let isFocused = false;

    /**
     * Parse text and set the number field value accordingly.
     */
    function parseAndSetValue(text: string): void {
      const trimmed = text.trim();
      if (trimmed === '' || trimmed === '-') {
        numberField().setValue(null);
      } else {
        const parsed = parseFloat(trimmed);
        if (!isNaN(parsed)) {
          numberField().setValue(parsed);
        }
      }
    }

    /**
     * Commit the current input text to the number field value.
     * Called before increment/decrement so they operate on the displayed value.
     */
    function commitInputValue(): void {
      if (!isFocused) return;
      parseAndSetValue(elementRef.nativeElement.value);
    }

    // Register the commit function with the number field so buttons can trigger it
    numberField().registerInputCommit(commitInputValue);

    function formatDisplayValue(): string {
      const val = numberField().value();
      return val !== null ? String(val) : '';
    }

    // Sync input display value when the number field value changes
    // (programmatically, via stepping, or on commit)
    explicitEffect([() => numberField().value()], ([value]) => {
      elementRef.nativeElement.value = value !== null ? String(value) : '';
    });

    listener(elementRef, 'focus', () => {
      isFocused = true;
    });

    listener(elementRef, 'blur', () => {
      isFocused = false;
      parseAndSetValue(elementRef.nativeElement.value);

      // Always sync the display value on blur to show the clamped/stepped value
      elementRef.nativeElement.value = formatDisplayValue();
    });

    // Reject characters that can't form a valid number
    listener(elementRef, 'beforeinput', (event: InputEvent) => {
      if (numberField().disabled() || numberField().readonly()) return;

      // Only filter insertions (typing, paste, drop)
      const insertTypes = ['insertText', 'insertFromPaste', 'insertFromDrop'];
      if (!insertTypes.includes(event.inputType) || !event.data) return;

      const input = elementRef.nativeElement;
      const selStart = input.selectionStart ?? 0;
      const selEnd = input.selectionEnd ?? 0;
      const current = input.value;
      const proposed = current.slice(0, selStart) + event.data + current.slice(selEnd);

      const minVal = numberField().min();
      const allowsNegative = !isFinite(minVal) || minVal < 0;

      // Build a regex for valid partial number input
      const pattern = allowsNegative ? /^-?(\d+\.?\d*|\.\d*)?$/ : /^(\d+\.?\d*|\.\d*)?$/;

      if (!pattern.test(proposed)) {
        event.preventDefault();
      }
    });

    // Keyboard interactions
    listener(elementRef, 'keydown', (event: KeyboardEvent) => {
      if (numberField().disabled() || numberField().readonly()) return;

      const useLargeStep = event.shiftKey;

      function getLargeStepMultiplier(): number {
        const s = numberField().step();
        if (!isFinite(s) || s <= 0) return 1;
        return numberField().largeStep() / s;
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          numberField().increment(useLargeStep ? getLargeStepMultiplier() : 1);
          elementRef.nativeElement.value = formatDisplayValue();
          break;
        case 'ArrowDown':
          event.preventDefault();
          numberField().decrement(useLargeStep ? getLargeStepMultiplier() : 1);
          elementRef.nativeElement.value = formatDisplayValue();
          break;
        case 'Home':
          if (isFinite(numberField().min())) {
            event.preventDefault();
            numberField().setValue(numberField().min());
            elementRef.nativeElement.value = formatDisplayValue();
          }
          break;
        case 'End':
          if (isFinite(numberField().max())) {
            event.preventDefault();
            numberField().setValue(numberField().max());
            elementRef.nativeElement.value = formatDisplayValue();
          }
          break;
        case 'Enter':
          parseAndSetValue(elementRef.nativeElement.value);
          elementRef.nativeElement.value = formatDisplayValue();
          break;
      }
    });

    // Mouse wheel support
    listener(
      elementRef,
      'wheel',
      (event: WheelEvent) => {
        if (!allowWheelScrub() || numberField().disabled() || numberField().readonly()) return;

        // Don't intercept browser zoom (Ctrl+wheel / Cmd+wheel)
        if (event.ctrlKey || event.metaKey) return;

        // Only handle when focused
        if (document.activeElement !== elementRef.nativeElement) return;

        event.preventDefault();

        if (event.deltaY < 0) {
          numberField().increment();
        } else if (event.deltaY > 0) {
          numberField().decrement();
        }

        elementRef.nativeElement.value = formatDisplayValue();
      },
      { config: { passive: false } },
    );

    function focus(): void {
      elementRef.nativeElement.focus({ preventScroll: true });
    }

    return {
      focus,
    } satisfies NgpNumberFieldInputState;
  },
);
