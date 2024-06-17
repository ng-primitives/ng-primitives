/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Highlightable } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectSelect } from '../select/select.token';
import { NgpSelectOptionToken } from './select-option.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
  providers: [{ provide: NgpSelectOptionToken, useExisting: NgpSelectOption }],
  host: {
    role: 'option',
    '[attr.id]': 'id()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.data-state]': 'selected() ? "selected" : "unselected"',
    '[attr.data-active]': 'active() ? "" : null',
    '[attr.data-disabled]': 'isDisabled()',
    '(click)': 'selectOption()',
  },
})
export class NgpSelectOption<T> implements Highlightable {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<T>();

  /**
   * Access the element reference.
   */
  protected readonly element = inject(ElementRef<HTMLElement>);

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
  readonly isDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectOptionDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the option is the active descendant.
   */
  protected readonly active = signal<boolean>(false);

  /**
   * Determine if the option is selected.
   */
  protected readonly selected = computed(() => this.select.value() === this.value());

  /**
   * Set the active styles for the option.
   * @internal
   */
  setActiveStyles(): void {
    this.active.set(true);

    // scroll the option into view if needed
    this.element.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Set the inactive styles for the option.
   * @internal
   */
  setInactiveStyles(): void {
    this.active.set(false);
  }

  /**
   * Handle the click event on the option.
   */
  protected selectOption(): void {
    if (!this.isDisabled()) {
      this.select.value.update(() => this.value());
      // close the dropdown after selecting an option
      this.select.open.set(false);
    }
  }
}
