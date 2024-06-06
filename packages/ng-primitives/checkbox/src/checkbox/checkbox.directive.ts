/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  HostListener,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpCheckboxIndicatorToken } from '../checkbox-indicator/checkbox-indicator.token';
import { NgpCheckboxToken } from './checkbox.token';

@Directive({
  selector: '[ngpCheckbox]',
  standalone: true,
  providers: [
    { provide: NgpCheckboxToken, useExisting: NgpCheckbox },
    { provide: NG_VALUE_ACCESSOR, useExisting: NgpCheckbox, multi: true },
  ],
})
export class NgpCheckbox implements ControlValueAccessor {
  /**
   * Defines whether the checkbox is checked.
   */
  readonly checked = model<boolean>(false, {
    alias: 'ngpCheckboxChecked',
  });

  /**
   * Defines whether the checkbox is indeterminate.
   */
  readonly indeterminate = model<boolean>(false, {
    alias: 'ngpCheckboxIndeterminate',
  });

  /**
   * Whether the checkbox is required.
   */
  readonly required = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxRequired',
    transform: booleanAttribute,
  });

  /**
   * Defines whether the checkbox is disabled.
   */
  readonly inputDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the checkbox is disabled by the form.
   */
  private readonly formDisabled = signal<boolean>(false);

  /**
   * Whether the checkbox is disabled.
   */
  readonly disabled = computed<boolean>(() => this.inputDisabled() || this.inputDisabled());

  /**
   * Determine the state
   * @returns 'checked' | 'unchecked' | 'indeterminate'
   */
  readonly state = computed<'checked' | 'unchecked' | 'indeterminate'>(() => {
    const checked = this.checked();

    if (this.indeterminate()) {
      return 'indeterminate';
    }

    return checked ? 'checked' : 'unchecked';
  });

  /**
   * Access the indicator instance
   * @internal
   */
  protected readonly indicator = contentChild(NgpCheckboxIndicatorToken, { descendants: true });

  /**
   * Access the indicator id
   */
  readonly indicatorId = computed<string | null>(() => this.indicator()?.id() ?? null);

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

  @HostListener('keydown.enter', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  @HostListener('keydown.space', ['$event'])
  toggle(event?: Event): void {
    // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
    event?.preventDefault();

    this.checked.set(this.indeterminate() ? true : !this.checked());
    this.onChange?.(this.checked());

    // if the checkbox was indeterminate, it isn't anymore
    if (this.indeterminate()) {
      this.indeterminate.set(false);
    }
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched?.();
  }

  /**
   * Sets the checked state of the checkbox.
   * @param checked The checked state of the checkbox.
   * @internal
   */
  writeValue(checked: boolean): void {
    this.checked.set(checked);
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
    this.formDisabled.set(isDisabled);
  }
}
