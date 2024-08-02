/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectPagination } from '../pagination/pagination.token';
import { NgpPaginationPreviousToken } from './pagination-previous.token';

@Directive({
  standalone: true,
  selector: '[ngpPaginationPrevious]',
  exportAs: 'ngpPaginationPrevious',
  providers: [{ provide: NgpPaginationPreviousToken, useExisting: NgpPaginationPrevious }],
  hostDirectives: [NgpButton],
  host: {
    '[attr.data-disabled]': 'disabled() || pagination.disabled() || pagination.firstPage()',
    '[attr.data-first-page]': 'pagination.firstPage()',
  },
})
export class NgpPaginationPrevious {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationPreviousDisabled',
    transform: booleanAttribute,
  });

  /**
   * Go to the previous page.
   */
  @HostListener('click')
  goToPreviousPage() {
    if (this.disabled() || this.pagination.firstPage()) {
      return;
    }

    this.pagination.page.set(this.pagination.page() - 1);
  }
}
