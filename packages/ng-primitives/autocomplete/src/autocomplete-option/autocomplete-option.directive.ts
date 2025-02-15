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
import { setupHover, setupPress } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocomplete } from '../autocomplete/autocomplete.token';
import { NgpAutocompleteOptionToken } from './autocomplete-option.token';

@Directive({
  standalone: true,
  selector: '[ngpAutocompleteOption]',
  exportAs: 'ngpAutocompleteOption',
  providers: [{ provide: NgpAutocompleteOptionToken, useExisting: NgpAutocompleteOption }],
  host: {
    '[id]': 'id()',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-disabled]': 'optionDisabled()',
  },
})
export class NgpAutocompleteOption<T> implements Highlightable, OnInit, OnDestroy {
  /** Access the autocomplete */
  private readonly autocomplete = injectAutocomplete<T>();

  /** Access the element ref */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The id of the option */
  readonly id = input<string>(uniqueId('ngp-autocomplete-option'));

  /** The value of the option */
  readonly value = input.required<T>({
    alias: 'ngpAutocompleteOptionValue',
  });

  /** Whether the option is disabled */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAutocompleteOptionDisabled',
    transform: booleanAttribute,
  });

  /** Whether the option is active */
  readonly active = signal(false);

  constructor() {
    setupHover({ disabled: this.optionDisabled });
    setupPress({ disabled: this.optionDisabled });
  }

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
