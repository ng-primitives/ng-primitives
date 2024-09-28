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
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { NgpPaginationToken } from './pagination.token';

@Directive({
  standalone: true,
  selector: '[ngpPagination]',
  exportAs: 'ngpPagination',
  providers: [{ provide: NgpPaginationToken, useExisting: NgpPagination }],
  host: {
    role: 'navigation',
    '[attr.data-page]': 'page()',
    '[attr.data-page-count]': 'pageCount()',
    '[attr.data-first-page]': 'firstPage()',
    '[attr.data-last-page]': 'lastPage()',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class NgpPagination {
  /**
   * The currently selected page.
   */
  readonly page = model<number>(1, {
    alias: 'ngpPaginationPage',
  });

  /**
   * The total number of pages.
   */
  readonly pageCount = input<number, NumberInput>(0, {
    alias: 'ngpPaginationPageCount',
    transform: numberAttribute,
  });

  /**
   * Whether the pagination is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationDisabled',
    transform: booleanAttribute,
  });

  /**
   * Determine if we are on the first page.
   * @internal
   */
  readonly firstPage = computed(() => this.page() === 1);

  /**
   * Determine if we are on the last page.
   * @internal
   */
  readonly lastPage = computed(() => this.page() === this.pageCount());
}
