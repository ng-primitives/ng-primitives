/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, contentChild, input, model, signal } from '@angular/core';
import { NgpSelectButtonToken } from '../select-button/select-button.token';
import { NgpSelectOptionsToken } from '../select-options/select-options.token';
import { NgpSelectToken } from './select.token';

@Directive({
  standalone: true,
  selector: '[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [{ provide: NgpSelectToken, useExisting: NgpSelect }],
})
export class NgpSelect<T> {
  /**
   * The selected value.
   */
  readonly value = model.required<T>({
    alias: 'ngpSelectValue',
  });

  /**
   * Whether the select dropdown is open.
   */
  readonly open = model<boolean>(false, {
    alias: 'ngpSelectOpen',
  });

  /**
   * Disable the select component.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the select button instance.
   * @internal
   */
  readonly button = contentChild.required(NgpSelectButtonToken, {
    descendants: true,
  });

  /**
   * Access the select options instance.
   * @internal
   */
  readonly options = contentChild(NgpSelectOptionsToken, {
    descendants: true,
  });

  /**
   * Store the dropdown dimensions.
   * @internal
   */
  readonly dropdownBounds = signal<DropdownBounds>({
    x: null,
    y: null,
    width: null,
  });
}

interface DropdownBounds {
  x: number | null;
  y: number | null;
  width: number | null;
}
