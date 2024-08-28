/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Highlightable } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgpHover, NgpPress } from 'ng-primitives/interactions';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocomplete } from '../autocomplete/autocomplete.token';
import { NgpAutocompleteOptionToken } from './autocomplete-option.token';

@Directive({
  standalone: true,
  selector: '[ngpAutocompleteOption]',
  exportAs: 'ngpAutocompleteOption',
  hostDirectives: [
    { directive: NgpHover, inputs: ['ngpHoverDisabled:ngpAutocompleteOptionDisabled'] },
    { directive: NgpPress, inputs: ['ngpPressDisabled:ngpAutocompleteOptionDisabled'] },
  ],
  providers: [{ provide: NgpAutocompleteOptionToken, useExisting: NgpAutocompleteOption }],
  host: {
    '[id]': 'id()',
    '[attr.data-active]': 'active()',
    '[attr.data-disabled]': 'optionDisabled()',
  },
})
export class NgpAutocompleteOption implements Highlightable, OnInit, OnDestroy {
  /** Access the autocomplete */
  private readonly autocomplete = injectAutocomplete();

  /** Access the element ref */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The id of the option */
  readonly id = input<string>(uniqueId('ngp-autocomplete-option'));

  /** Whether the option is disabled */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteOptionDisabled',
    transform: booleanAttribute,
  });

  /** Whether the option is active */
  readonly active = signal(false);

  ngOnInit(): void {
    this.autocomplete.registerOption(this);
  }

  ngOnDestroy(): void {
    this.autocomplete.unregisterOption(this);
  }

  /**
   * @internal
   */
  setActiveStyles(): void {
    this.setActive(true);
  }

  /**
   * @internal
   */
  setInactiveStyles(): void {
    this.setActive(false);
  }

  /**
   * @internal
   */
  setActive(value: boolean): void {
    this.active.set(value);
  }
}
