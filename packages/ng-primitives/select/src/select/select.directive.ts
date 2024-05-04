/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, model } from '@angular/core';
import { NgpSelectToken } from './select.token';

@Directive({
  standalone: true,
  selector: '[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [{ provide: NgpSelectToken, useExisting: NgpSelectDirective }],
})
export class NgpSelectDirective<T> {
  /**
   * The selected value.
   */
  readonly value = model.required<T>({
    alias: 'ngpSelectValue',
  });

  /**
   * Whether multiple values can be selected.
   */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectMultiple',
    transform: booleanAttribute,
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
}
