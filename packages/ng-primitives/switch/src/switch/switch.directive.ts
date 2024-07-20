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
  inject,
  input,
  model,
} from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpSwitchToken } from './switch.token';

@Directive({
  standalone: true,
  selector: '[ngpSwitch]',
  exportAs: 'ngpSwitch',
  providers: [
    { provide: NgpSwitchToken, useExisting: NgpSwitch },
    { provide: NgpDisabledToken, useExisting: NgpSwitch },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpPress, NgpFocusVisible],
  host: {
    role: 'switch',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-checked]': 'checked()',
    '[attr.disabled]': 'isButton && disabled() ? disabled() : null',
  },
})
export class NgpSwitch implements NgpCanDisable {
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
   * Toggle the checked state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.checked.update(checked => !checked);
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
