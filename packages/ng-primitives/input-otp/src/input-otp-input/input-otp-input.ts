import { AfterViewInit, Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpVisuallyHidden } from '../../../a11y/src';
import { injectInputOtpState } from '../input-otp/input-otp-state';

@Directive({
  selector: 'input[ngpInputOtpInput]',
  exportAs: 'ngpInputOtpInput',
  hostDirectives: [NgpVisuallyHidden],
  host: {
    autocomplete: 'one-time-code',
    '[attr.inputmode]': 'state().inputMode()',
    '[attr.maxlength]': 'state().maxLength()',
    '[attr.pattern]': 'state().pattern() || null',
    '[attr.disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpInputOtpInput implements AfterViewInit {
  /**
   * Access the element reference.
   */
  readonly elementRef = injectElementRef<HTMLInputElement>();

  /**
   * Access the input-otp state.
   */
  protected readonly state = injectInputOtpState();

  constructor() {
    // Register this input with the parent
    this.state().registerInput(this);
  }

  ngAfterViewInit(): void {
    // Set initial value
    this.elementRef.nativeElement.value = this.state().value();
  }

  /**
   * Focus the input.
   * @internal
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  /**
   * Set selection range.
   * @param start Start position
   * @param end End position
   * @internal
   */
  setSelectionRange(start: number, end: number): void {
    this.elementRef.nativeElement.setSelectionRange(start, end);
  }

  /**
   * Handle input events (typing).
   */
  @HostListener('input', ['$event'])
  protected onInput(event: Event): void {
    if (this.state().disabled()) {
      return;
    }

    const input = event.target as HTMLInputElement;
    let newValue = input.value;

    // Validate against pattern if provided
    const pattern = this.state().pattern();
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

    // Clamp to maxLength
    const maxLength = this.state().maxLength();
    if (newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
      input.value = newValue;
    }

    this.state().updateValue(newValue);
    this.updateSelection();
  }

  /**
   * Handle paste events.
   */
  @HostListener('paste', ['$event'])
  protected onPaste(event: ClipboardEvent): void {
    if (this.state().disabled()) {
      return;
    }

    event.preventDefault();

    const clipboardData = event.clipboardData?.getData('text') || '';
    let pastedText = clipboardData.trim();

    // Apply paste transformer if provided
    const transformer = this.state().pasteTransformer();
    if (transformer) {
      pastedText = transformer(pastedText);
    }

    // Validate against pattern if provided
    const pattern = this.state().pattern();
    if (pattern) {
      const patternRegex = new RegExp(pattern);
      pastedText = pastedText
        .split('')
        .filter(char => patternRegex.test(char))
        .join('');
    }

    // Clamp to maxLength
    const maxLength = this.state().maxLength();
    if (pastedText.length > maxLength) {
      pastedText = pastedText.substring(0, maxLength);
    }

    // Update the input value and state
    this.elementRef.nativeElement.value = pastedText;
    this.state().updateValue(pastedText);

    // Set caret to the end
    const endPosition = pastedText.length;
    this.setSelectionRange(endPosition, endPosition);
    this.updateSelection();
  }

  /**
   * Handle focus events.
   */
  @HostListener('focus')
  protected onFocus(): void {
    this.state().updateFocus(true);
    this.updateSelection();
  }

  /**
   * Handle blur events.
   */
  @HostListener('blur')
  protected onBlur(): void {
    this.state().updateFocus(false);
  }

  /**
   * Handle keyup events to update selection.
   */
  @HostListener('keyup')
  protected onKeyup(): void {
    this.updateSelection();
  }

  /**
   * Handle selection change events.
   */
  @HostListener('select')
  protected onSelect(): void {
    this.updateSelection();
  }

  /**
   * Update the selection state.
   */
  private updateSelection(): void {
    const input = this.elementRef.nativeElement;
    const maxLength = this.state().maxLength();

    // If input is at max length, set selection to last character
    if (input.value.length === maxLength) {
      input.setSelectionRange(input.value.length - 1, input.value.length);
    }

    // if the input is not at max length, set selection at the end
    if (input.value.length < maxLength) {
      input.setSelectionRange(input.value.length, input.value.length);
    }

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    this.state().updateSelection(start, end);
  }
}
