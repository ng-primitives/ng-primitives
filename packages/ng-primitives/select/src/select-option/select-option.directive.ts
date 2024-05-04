/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { NgpSelectOptionToken } from './select-option.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
  providers: [{ provide: NgpSelectOptionToken, useExisting: NgpSelectOptionDirective }],
})
export class NgpSelectOptionDirective<T> {
  /**
   * The value of the option.
   */
  readonly value = input.required<T>({
    alias: 'ngpSelectOptionValue',
  });

  /**
   * Whether the option is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectOptionDisabled',
    transform: booleanAttribute,
  });
}
