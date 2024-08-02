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
import { NgpPaginationNextToken } from './pagination-next.token';

@Directive({
  standalone: true,
  selector: '[ngpPaginationNext]',
  exportAs: 'ngpPaginationNext',
  providers: [{ provide: NgpPaginationNextToken, useExisting: NgpPaginationNext }],
  hostDirectives: [NgpButton],
  host: {
    '[attr.data-disabled]': 'disabled() || pagination.disabled() || pagination.lastPage()',
    '[attr.data-last-page]': 'pagination.lastPage()',
  },
})
export class NgpPaginationNext {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationNextDisabled',
    transform: booleanAttribute,
  });

  /**
   * Go to the next page.
   */
  @HostListener('click')
  goToNextPage(): void {
    if (this.disabled() || this.pagination.lastPage()) {
      return;
    }

    this.pagination.page.set(this.pagination.page() + 1);
  }
}
