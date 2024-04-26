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
  ElementRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpSwitchToken } from './switch.token';

@Directive({
  standalone: true,
  selector: '[ngpSwitch]',
  exportAs: 'ngpSwitch',
  providers: [
    { provide: NgpSwitchToken, useExisting: NgpSwitchDirective },
    { provide: NG_VALUE_ACCESSOR, useExisting: NgpSwitchDirective, multi: true },
  ],
  host: {
    role: 'switch',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '[attr.data-disabled]': 'disabledState() ? "true" : null',
    '[attr.disabled]': 'isButton && disabledState() ? disabledState() : null',
    '(focus)': 'onTouched?.()',
  },
})
export class NgpSwitchDirective implements ControlValueAccessor {
  /**
   * Access the element ref.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Determine if the switch is a button
   */
  protected isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  /**
   * Determine if the switch is checked.
   * @default false
   */
  readonly checked = model<boolean>(false, {
    alias: 'ngpSwitchChecked',
  });

  /**
   * Determine if the switch is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSwitchDisabled',
    transform: booleanAttribute,
  });

  /**
   * Store the form disabled state.
   * @internal
   */
  readonly formDisabled = signal<boolean>(false);

  /**
   * Derive the disabled state based on the input and form disabled state.
   * @internal
   */
  readonly disabledState = computed(() => this.disabled() || this.formDisabled());

  /**
   * Store the onChange callback.
   */
  private onChange?: (checked: boolean) => void;

  /**
   * Store the onTouched callback.
   */
  protected onTouched?: () => void;

  /**
   * Register the onChange callback.
   * @param fn The onChange callback.
   * @internal
   */
  registerOnChange(fn: (checked: boolean) => void): void {
    this.onChange = fn;
  }

  /**
   * Register the onTouched callback.
   * @param fn The onTouched callback.
   * @internal
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Write the value to the checked state.
   * @param checked The checked state.
   * @internal
   */
  writeValue(checked: boolean): void {
    this.checked.set(checked);
  }

  /**
   * Set the disabled state.
   * @param isDisabled The disabled state.
   * @internal
   */
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Toggle the checked state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabledState()) {
      return;
    }

    this.checked.set(!this.checked());
    this.onChange?.(this.checked());
  }

  /**
   * Handle the keydown event.
   */
  @HostListener('keydown.space')
  protected onKeyDown(): void {
    // If the switch is not a button then the space key will not toggle the checked state automatically,
    // so we need to do it manually.
    if (!this.isButton) {
      this.toggle();
    }
  }
}
