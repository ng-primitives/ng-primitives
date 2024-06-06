/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpRovingFocusGroup } from '@ng-primitives/ng-primitives/roving-focus';
import { NgpRadioGroupToken } from './radio-group.token';

@Directive({
  selector: '[ngpRadioGroup]',
  standalone: true,
  providers: [
    { provide: NgpRadioGroupToken, useExisting: NgpRadioGroup },
    { provide: NG_VALUE_ACCESSOR, useExisting: NgpRadioGroup, multi: true },
  ],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'radiogroup',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-disabled]': 'disabled() || formDisabled() ? "" : null',
  },
})
export class NgpRadioGroup implements ControlValueAccessor {
  /**
   * The value of the radio group.
   */
  readonly value = model<string | null>(null, { alias: 'ngpRadioGroupValue' });

  /**
   * Whether the radio group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the radio group is disabled via the form.
   */
  readonly formDisabled = signal<boolean>(false);

  /**
   * The orientation of the radio group.
   * @default 'horizontal'
   */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal', {
    alias: 'ngpRadioGroupOrientation',
  });

  /**
   * The callback function to call when the value of the radio group changes.
   * @internal
   */
  private onChange?: (value: string) => void;

  /**
   * The callback function to call when the radio group is touched.
   * @internal
   */
  private onTouched?: () => void;

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: string): void {
    this.value.set(value);
    this.onChange?.(value);
  }

  /**
   * Update the value of the radio group.
   * @param value The new value of the radio group.
   * @internal
   */
  writeValue(value: string): void {
    this.value.set(value);
  }

  /**
   * Register a callback function to call when the value of the radio group changes.
   * @param fn The callback function to call when the value of the radio group changes.
   * @internal
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set the disabled state of the radio group.
   * @param isDisabled Whether the radio group is disabled.
   * @internal
   */
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * When focus leaves the radio group, mark it as touched.
   * @internal
   */
  @HostListener('focusout')
  protected onFocusout(): void {
    this.onTouched?.();
  }
}
