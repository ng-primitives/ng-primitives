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
} from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCheckboxIndicatorToken } from '../checkbox-indicator/checkbox-indicator.token';
import { NgpCheckboxToken } from './checkbox.token';

@Directive({
  selector: '[ngpCheckbox]',
  standalone: true,
  providers: [{ provide: NgpCheckboxToken, useExisting: NgpCheckbox }],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpCheckbox {
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
   * Access the indicator id
   */
  readonly indicatorId = computed<string | null>(() => this.indicator()?.id() ?? null);

  /**
   * Access the indicator instance
   * @internal
   */
  protected readonly indicator = contentChild(NgpCheckboxIndicatorToken, { descendants: true });

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
