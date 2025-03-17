/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, model } from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { controlState, provideControlState } from 'ng-primitives/forms';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { provideCheckbox } from './checkbox.token';

@Directive({
  selector: '[ngpCheckbox]',
  standalone: true,
  providers: [
    provideCheckbox(NgpCheckbox),
    provideControlState(),
    { provide: NgpDisabledToken, useExisting: NgpCheckbox },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocusVisible, NgpPress],
  host: {
    role: 'checkbox',
    '[attr.aria-checked]': 'indeterminate() ? "mixed" : state.value()',
    '[attr.data-checked]': 'state.value() ? "" : null',
    '[attr.data-indeterminate]': 'indeterminate() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[tabindex]': 'state.disabled() ? -1 : 0',
  },
})
export class NgpCheckbox implements NgpCanDisable {
  /**
   * The id of the checkbox.
   * @internal
   */
  readonly id = input(uniqueId('ngp-checkbox'));

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
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The form control state. This is used to allow communication between the checkbox and the control value access and any
   * components that use this as a host directive.
   */
  protected readonly state = controlState({
    value: this.checked,
    disabled: this.disabled,
  });

  @HostListener('keydown.enter', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  @HostListener('keydown.space', ['$event'])
  toggle(event?: Event): void {
    if (this.state.disabled()) {
      return;
    }

    // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
    event?.preventDefault();

    this.state.setValue(this.indeterminate() ? true : !this.state.value());

    // if the checkbox was indeterminate, it isn't anymore
    if (this.indeterminate()) {
      this.indeterminate.set(false);
    }
  }
}
