import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpCheckboxToken } from './checkbox.token';

@Directive({
  selector: 'button[ngpCheckbox]',
  standalone: true,
  providers: [
    { provide: NgpCheckboxToken, useExisting: NgpCheckboxDirective },
    { provide: NG_VALUE_ACCESSOR, useExisting: NgpCheckboxDirective, multi: true },
  ],
  host: {
    type: 'button',
    role: 'checkbox',
    '[disabled]': 'disabled',
    '[attr.aria-checked]': 'indeterminate ? "mixed" : checked',
    '[attr.data-disabled]': 'disabled ? "" : null',
    '[attr.data-state]': 'state',
  },
})
export class NgpCheckboxDirective implements ControlValueAccessor {
  /**
   * Defines whether the checkbox is checked.
   */
  @Input({ alias: 'ngpCheckboxChecked', transform: booleanAttribute }) checked: boolean = false;

  /**
   * Defines whether the checkbox is indeterminate.
   */
  @Input({ alias: 'ngpCheckboxIndeterminate', transform: booleanAttribute })
  indeterminate: boolean = false;

  /**
   * Defines whether the checkbox is disabled.
   */
  @Input({ alias: 'ngpCheckboxDisabled', transform: booleanAttribute }) disabled: boolean = false;

  /**
   * Event emitted when the checkbox checked state changes.
   */
  @Output('ngpCheckboxCheckedChange') readonly checkedChange = new EventEmitter<boolean>();

  /**
   * Event emitted when the indeterminate state changes.
   */
  @Output('ngpCheckboxIndeterminateChange') readonly indeterminateChange =
    new EventEmitter<boolean>();

  /**
   * Determine the state
   * @returns 'checked' | 'unchecked' | 'indeterminate'
   */
  protected get state(): 'checked' | 'unchecked' | 'indeterminate' {
    if (this.indeterminate) {
      return 'indeterminate';
    }
    return this.checked ? 'checked' : 'unchecked';
  }

  /**
   * Store the callback function that should be called when the checkbox checked state changes.
   * @internal
   */
  private onChange?: (checked: boolean) => void;

  /**
   * Store the callback function that should be called when the checkbox is blurred.
   * @internal
   */
  private onTouched?: () => void;

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  @HostListener('click')
  onClick(): void {
    this.checked = this.indeterminate ? true : !this.checked;
    this.checkedChange.emit(this.checked);
    this.onChange?.(this.checked);

    // if the checkbox was indeterminate, it isn't anymore
    if (this.indeterminate) {
      this.indeterminate = false;
      this.indeterminateChange.emit(this.indeterminate);
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched?.();
  }

  /**
   * Sets the checked state of the checkbox.
   * @param checked The checked state of the checkbox.
   * @internal
   */
  writeValue(checked: boolean): void {
    this.checked = checked;
  }

  /**
   * Registers a callback function that should be called when the checkbox checked state changes.
   * @param fn The callback function.
   * @internal
   */
  registerOnChange(fn: (checked: boolean) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function that should be called when the checkbox is blurred.
   * @param fn The callback function.
   * @internal
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the checkbox.
   * @param isDisabled The disabled state of the checkbox.
   * @internal
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
