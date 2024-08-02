/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  numberAttribute,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectPagination } from '../pagination/pagination.token';
import { NgpPaginationButtonToken } from './pagination-button.token';

@Directive({
  standalone: true,
  selector: '[ngpPaginationButton]',
  exportAs: 'ngpPaginationButton',
  providers: [{ provide: NgpPaginationButtonToken, useExisting: NgpPaginationButton }],
  hostDirectives: [NgpButton],
  host: {
    '[attr.data-disabled]': 'disabled() || pagination.disabled()',
    '[attr.data-page]': 'page()',
    '[attr.data-selected]': 'selected()',
    '[attr.aria-current]': 'selected()',
  },
})
export class NgpPaginationButton {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Define the page this button represents.
   */
  readonly page = input.required<number, NumberInput>({
    alias: 'ngpPaginationButtonPage',
    transform: numberAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationButtonDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether this page is the currently selected page.
   */
  protected readonly selected = computed(() => this.page() === this.pagination.page());

  /**
   * Go to the page this button represents.
   */
  @HostListener('click')
  goToPage(): void {
    if (this.disabled()) {
      return;
    }

    this.pagination.page.set(this.page());
  }
}
