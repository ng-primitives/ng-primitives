// Much of the code in this file is inspired by BaseUI:
// https://github.com/mui/base-ui/blob/master/packages/react/src/number-field/input/NumberFieldInput.tsx
import { computed, Directive, HostListener } from '@angular/core';
import { injectFormFieldState } from 'ng-primitives/form-field';
import { injectElementRef } from '../../../internal/src';
import { injectNumberPickerState } from '../number-picker/number-picker-state';
import { formatNumber } from '../utils/fomat-number';
import { ARABIC_RE, getNumberLocaleDetails, HAN_RE, parseNumber } from '../utils/parse';

@Directive({
  selector: 'input[ngpNumberPickerInput]',
  exportAs: 'ngpNumberPickerInput',
  host: {
    '[value]': 'inputValue()',
    type: 'text',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    '[attr.aria-labelledby]': 'formField()?.labelledBy()',
  },
})
export class NgpNumberPickerInput {
  /** Access the number picker state */
  protected readonly state = injectNumberPickerState();

  /** Access the form field that the form control is associated with. */
  protected readonly formField = injectFormFieldState({ optional: true });

  /** Access the element reference */
  protected readonly elementRef = injectElementRef<HTMLInputElement>();

  protected readonly inputValue = computed(() => {
    const value = this.state().value();

    if (value === undefined) {
      return '';
    }

    return formatNumber(value, this.state().locale(), this.state().format());
  });

  /** Whether the input has been touched */
  protected touched = false;

  /** Whether the input is focused */
  protected focused = false;

  @HostListener('focus', ['$event'])
  protected onFocus(event: FocusEvent): void {
    if (this.state().readonly() || this.state().disabled() || this.touched) {
      return;
    }

    this.touched = true;
    this.focused = true;

    // Browsers set selection at the start of the input field by default. We want to set it at
    // the end for the first focus.
    const target = event.target as HTMLInputElement;
    const length = target.value.length;
    target.setSelectionRange(length, length);
  }

  @HostListener('blur', ['$event'])
  protected onBlur(): void {
    if (this.state().readonly() || this.state().disabled()) {
      return;
    }

    this.touched = true;
    this.focused = false;

    // allowInputSyncRef.current = true;

    if (this.elementRef.nativeElement.value.trim() === '') {
      this.setValue(undefined);
      return;
    }

    const inputValue = this.elementRef.nativeElement.value;
    const parsedValue = parseNumber(inputValue, this.state().locale(), this.state().format());

    if (parsedValue !== null) {
      this.setValue(parsedValue);
    }
  }

  @HostListener('change')
  protected onChange(): void {
    // allowInputSyncRef.current = false;
    const targetValue = this.elementRef.nativeElement.value;

    if (targetValue.trim() === '') {
      this.setValue(undefined);
      return;
    }

    const parsedValue = parseNumber(targetValue, this.state().locale(), this.state().format());

    if (parsedValue !== null) {
      this.setValue(parsedValue);
    }
  }

  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.state().readonly() || this.state().disabled()) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLInputElement;
    const inputValue = currentTarget.value;

    // allowInputSyncRef.current = true;

    const allowedNonNumericKeys = this.state().getAllowedNonNumericKeys();

    let isAllowedNonNumericKey = allowedNonNumericKeys.includes(event.key);

    const { decimal, currency, percentSign } = getNumberLocaleDetails([], this.state().format());

    const selectionStart = currentTarget.selectionStart;
    const selectionEnd = currentTarget.selectionEnd;
    const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;

    // Allow the minus key only if there isn't already a plus or minus sign, or if all the text
    // is selected, or if only the minus sign is highlighted.
    if (event.key === '-' && allowedNonNumericKeys.includes('-')) {
      const isMinusHighlighted =
        selectionStart === 0 && selectionEnd === 1 && inputValue[0] === '-';
      isAllowedNonNumericKey = !inputValue.includes('-') || isAllSelected || isMinusHighlighted;
    }

    // Only allow one of each symbol.
    [decimal, currency, percentSign].forEach(symbol => {
      if (event.key === symbol) {
        const symbolIndex = inputValue.indexOf(symbol);
        const isSymbolHighlighted =
          selectionStart === symbolIndex && selectionEnd === symbolIndex + 1;
        isAllowedNonNumericKey =
          !inputValue.includes(symbol) || isAllSelected || isSymbolHighlighted;
      }
    });

    const isLatinNumeral = /^[0-9]$/.test(event.key);
    const isArabicNumeral = ARABIC_RE.test(event.key);
    const isHanNumeral = HAN_RE.test(event.key);
    const isNavigateKey = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Enter',
    ].includes(event.key);

    if (
      // Allow composition events (e.g., pinyin)
      // event.nativeEvent.isComposing does not work in Safari:
      // https://bugs.webkit.org/show_bug.cgi?id=165004
      event.which === 229 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      isAllowedNonNumericKey ||
      isLatinNumeral ||
      isArabicNumeral ||
      isHanNumeral ||
      isNavigateKey
    ) {
      return;
    }

    // Prevent insertion of text or caret from moving.
    event.preventDefault();

    if (event.key === 'ArrowUp') {
      this.state().increment(event);
    } else if (event.key === 'ArrowDown') {
      this.state().decrement(event);
    } else if (event.key === 'Home') {
      this.setValue(this.state().min());
    } else if (event.key === 'End') {
      this.setValue(this.state().max());
    }
  }

  @HostListener('paste', ['$event'])
  protected onPaste(event: ClipboardEvent): void {
    if (this.state().readonly() || this.state().disabled()) {
      return;
    }

    // Prevent `onChange` from being called.
    event.preventDefault();

    const clipboardData = event.clipboardData || window.Clipboard;
    debugger;
    const pastedData = (clipboardData as any).getData('text/plain');
    const parsedValue = parseNumber(pastedData, this.state().locale(), this.state().format());

    if (parsedValue !== null) {
      // allowInputSyncRef.current = false;
      this.setValue(parsedValue);
    }
  }

  /** Set the value of the input */
  private setValue(value: number | undefined): void {
    this.state().value.set(value);
    this.state().valueChange.emit(value);
  }
}
