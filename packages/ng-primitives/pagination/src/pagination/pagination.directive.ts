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
import { controlState, provideControlState } from 'ng-primitives/forms';
import { providePagination } from './pagination.token';

@Directive({
  standalone: true,
  selector: '[ngpPagination]',
  exportAs: 'ngpPagination',
  providers: [providePagination(NgpPagination), provideControlState()],
  host: {
    role: 'navigation',
    '[attr.data-page]': 'state.value()',
    '[attr.data-page-count]': 'pageCount()',
    '[attr.data-first-page]': 'firstPage() ? "" : null',
    '[attr.data-last-page]': 'lastPage() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
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
   * The form control state. This is used to allow communication between the pagination and the control value access and any
   * components that use this as a host directive.
   * @internal
   */
  readonly state = controlState({
    value: this.page,
    disabled: this.disabled,
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

  /**
   * Go to the specified page.
   * @param page The page to go to.
   */
  goToPage(page: number) {
    // check if the page is within the bounds of the pagination
    if (page < 1 || page > this.pageCount()) {
      return;
    }

    this.state.setValue(page);
  }
}
