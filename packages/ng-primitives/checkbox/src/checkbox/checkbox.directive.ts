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
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { NgpCheckboxToken } from './checkbox.token';

@Directive({
  selector: '[ngpCheckbox]',
  standalone: true,
  providers: [
    { provide: NgpCheckboxToken, useExisting: NgpCheckbox },
    { provide: NgpDisabledToken, useExisting: NgpCheckbox },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocusVisible, NgpPress],
  host: {
    role: 'checkbox',
    '[attr.aria-checked]': 'indeterminate() ? "mixed" : checked()',
    '[attr.data-checked]': 'checked() ? "" : null',
    '[attr.data-indeterminate]': 'indeterminate() ? "" : null',
    '[tabindex]': 'disabled() ? -1 : 0',
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

  @HostListener('keydown.enter', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  @HostListener('keydown.space', ['$event'])
  toggle(event?: Event): void {
    if (this.disabled()) {
      return;
    }

    // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
    event?.preventDefault();

    this.checked.set(this.indeterminate() ? true : !this.checked());

    // if the checkbox was indeterminate, it isn't anymore
    if (this.indeterminate()) {
      this.indeterminate.set(false);
    }
  }
}
