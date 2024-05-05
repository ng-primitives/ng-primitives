/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectSelect } from '../select/select.token';
import { NgpSelectOptionToken } from './select-option.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
  providers: [{ provide: NgpSelectOptionToken, useExisting: NgpSelectOptionDirective }],
  host: {
    role: 'option',
    '[attr.id]': 'id()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.data-state]': 'selected() ? "selected" : "unselected"',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class NgpSelectOptionDirective<T> {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<T>();

  /**
   * Optionally define an id for the option. By default, the id is generated.
   */
  readonly id = input<string>(uniqueId('select-option'));

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

  /**
   * Determine if the option is selected.
   */
  protected readonly selected = computed(() => this.select.value() === this.value());
}
