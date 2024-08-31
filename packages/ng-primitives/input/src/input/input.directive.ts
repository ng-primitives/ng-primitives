/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgpAutofill } from 'ng-primitives/autofill';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocus, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpInputToken } from './input.token';

@Directive({
  standalone: true,
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [
    { provide: NgpInputToken, useExisting: NgpInput },
    { provide: NgpDisabledToken, useExisting: NgpInput },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocus, NgpPress, NgpAutofill],
})
export class NgpInput implements NgpCanDisable {
  /**
   * Access the underlying input element.
   * @internal
   */
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Sync the input value.
   * @internal
   */
  readonly value = signal<string>(this.elementRef.nativeElement.value);

  /**
   * Set the element input value and dispatch input event.
   * @param value The value to set.
   * @description The HTML input event triggers when a user interacts with an input field and changes its value. However, if the value is changed programmatically, the input event doesn't fire automatically, so we manually dispatch the InputEvent.
   * @internal
   */
  setInputValue(value: string) {
    this.elementRef.nativeElement.value = value;
    this.elementRef.nativeElement.dispatchEvent(new InputEvent('input'));
  }

  @HostListener('input')
  protected valueDidChange(): void {
    this.value.set(this.elementRef.nativeElement.value);
  }
}
