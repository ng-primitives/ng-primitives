/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectPagination } from '../pagination/pagination.token';
import { NgpPaginationLastToken } from './pagination-last.token';

@Directive({
  standalone: true,
  selector: '[ngpPaginationLast]',
  exportAs: 'ngpPaginationLast',
  providers: [
    { provide: NgpPaginationLastToken, useExisting: NgpPaginationLast },
    { provide: NgpDisabledToken, useExisting: NgpPaginationLast },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled()',
    '[attr.data-last-page]': 'pagination.lastPage()',
  },
})
export class NgpPaginationLast implements NgpCanDisable {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationLastDisabled',
    transform: booleanAttribute,
  });

  readonly disabled = computed(
    () => this.buttonDisabled() || this.pagination.disabled() || this.pagination.lastPage(),
  );

  /**
   * Go to the last page.
   */
  @HostListener('click')
  goToLastPage(): void {
    if (this.disabled()) {
      return;
    }

    this.pagination.page.set(this.pagination.pageCount());
  }
}
