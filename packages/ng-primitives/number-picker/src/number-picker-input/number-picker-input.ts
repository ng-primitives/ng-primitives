// Much of the code in this file is inspired by BaseUI:
// https://github.com/mui/base-ui/blob/master/packages/react/src/number-field/input/NumberFieldInput.tsx
import { Directive, HostListener } from '@angular/core';
import { injectFormFieldState } from 'ng-primitives/form-field';
import { injectNumberPickerState } from '../number-picker/number-picker-state';
import { injectElementRef } from '../../../internal/src';

@Directive({
  selector: 'input[ngpNumberPickerInput]',
  exportAs: 'ngpNumberPickerInput',
  host: {
    '[attr.value]': 'state().value()',
    type: 'text',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    'aria-roledescription': 'Number picker',
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

  /** Whether the input has been touched */
  protected touched = false;

  /** Whether the input is focused */
  protected focused = false;

  @HostListener('focus', ['$event'])
  protectedonFocus(event: FocusEvent): void {
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
  protected onBlur(event: FocusEvent): void {
    if (this.state().readonly() || this.state().disabled()) {
      return;
    }

    this.touched = true;
    this.focused = false;


    // allowInputSyncRef.current = true;

    if (this.elementRef.nativeElement.value.trim() === '') {
      this.setValue(null);
      return;
    }

    const parsedValue = parseNumber(inputValue, locale, formatOptionsRef.current);

    if (parsedValue !== null) {
      setValue(parsedValue, event.nativeEvent);
    }
  }

  onChange(event) {
    // Workaround for https://github.com/facebook/react/issues/9023
    if (event.nativeEvent.defaultPrevented) {
      return;
    }

    allowInputSyncRef.current = false;
    const targetValue = event.target.value;

    if (targetValue.trim() === '') {
      setInputValue(targetValue);
      setValue(null, event.nativeEvent);
      return;
    }

    if (event.isTrusted) {
      setInputValue(targetValue);
      return;
    }

    const parsedValue = parseNumber(targetValue, locale, formatOptionsRef.current);

    if (parsedValue !== null) {
      setInputValue(targetValue);
      setValue(parsedValue, event.nativeEvent);
    }
  },
  onKeyDown(event) {
    if (event.defaultPrevented || readOnly || disabled) {
      return;
    }

    const nativeEvent = event.nativeEvent;

    allowInputSyncRef.current = true;

    const allowedNonNumericKeys = getAllowedNonNumericKeys();

    let isAllowedNonNumericKey = allowedNonNumericKeys.includes(event.key);

    const { decimal, currency, percentSign } = getNumberLocaleDetails(
      [],
      formatOptionsRef.current,
    );

    const selectionStart = event.currentTarget.selectionStart;
    const selectionEnd = event.currentTarget.selectionEnd;
    const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;

    // Allow the minus key only if there isn't already a plus or minus sign, or if all the text
    // is selected, or if only the minus sign is highlighted.
    if (event.key === '-' && allowedNonNumericKeys.includes('-')) {
      const isMinusHighlighted =
        selectionStart === 0 && selectionEnd === 1 && inputValue[0] === '-';
      isAllowedNonNumericKey =
        !inputValue.includes('-') || isAllSelected || isMinusHighlighted;
    }

    // Only allow one of each symbol.
    [decimal, currency, percentSign].forEach((symbol) => {
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

    // We need to commit the number at this point if the input hasn't been blurred.
    const parsedValue = parseNumber(inputValue, locale, formatOptionsRef.current);

    const amount = getStepAmount(event) ?? DEFAULT_STEP;

    // Prevent insertion of text or caret from moving.
    event.preventDefault();

    if (event.key === 'ArrowUp') {
      incrementValue(amount, 1, parsedValue, nativeEvent);
    } else if (event.key === 'ArrowDown') {
      incrementValue(amount, -1, parsedValue, nativeEvent);
    } else if (event.key === 'Home' && min != null) {
      setValue(min, nativeEvent);
    } else if (event.key === 'End' && max != null) {
      setValue(max, nativeEvent);
    }
  },
  onPaste(event) {
    if (event.defaultPrevented || readOnly || disabled) {
      return;
    }

    // Prevent `onChange` from being called.
    event.preventDefault();

    const clipboardData = event.clipboardData || window.Clipboard;
    const pastedData = clipboardData.getData('text/plain');
    const parsedValue = parseNumber(pastedData, locale, formatOptionsRef.current);

    if (parsedValue !== null) {
      allowInputSyncRef.current = false;
      setValue(parsedValue, event.nativeEvent);
      setInputValue(pastedData);
    }
  }

  /** Set the value of the input */
  private setValue(value: number | undefined): void {
    this.state().value.set(value);
    this.state().valueChange.emit(value);
  }
}
