/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Highlightable } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, ElementRef, booleanAttribute, inject, input, signal } from '@angular/core';
import { NgpAutocompleteOptionToken } from './autocomplete-option.token';

@Directive({
  standalone: true,
  selector: '[ngpAutocompleteOption]',
  exportAs: 'ngpAutocompleteOption',
  providers: [{ provide: NgpAutocompleteOptionToken, useExisting: NgpAutocompleteOption }],
  host: {
    '[attr.data-disabled]': 'optionDisabled()',
  },
})
export class NgpAutocompleteOption implements Highlightable {
  /** Access the element ref */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Whether the option is disabled */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteOptionDisabled',
    transform: booleanAttribute,
  });

  /** Whether the option is active */
  readonly active = signal(false);

  setActiveStyles(): void {
    this.active.set(true);
  }

  setInactiveStyles(): void {
    this.active.set(false);
  }
}
