import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { paginationState, providePaginationState } from './pagination-state';

/**
 * The `NgpPagination` directive is used to create a pagination control.
 */
@Directive({
  selector: '[ngpPagination]',
  exportAs: 'ngpPagination',
  providers: [providePaginationState()],
  host: {
    role: 'navigation',
    '[attr.data-page]': 'state.page()',
    '[attr.data-page-count]': 'state.pageCount()',
    '[attr.data-first-page]': 'firstPage() ? "" : null',
    '[attr.data-last-page]': 'lastPage() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpPagination {
  /**
   * The currently selected page.
   */
  readonly page = input<number, NumberInput>(1, {
    alias: 'ngpPaginationPage',
    transform: numberAttribute,
  });

  /**
   * The event that is fired when the page changes.
   */
  readonly pageChange = output<number>({
    alias: 'ngpPaginationPageChange',
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
  readonly firstPage = computed(() => this.state.page() === 1);

  /**
   * Determine if we are on the last page.
   * @internal
   */
  readonly lastPage = computed(() => this.state.page() === this.state.pageCount());

  /**
   * The control state for the pagination.
   * @internal
   */
  private readonly state = paginationState<NgpPagination>(this);

  /**
   * Go to the specified page.
   * @param page The page to go to.
   */
  goToPage(page: number) {
    // check if the page is within the bounds of the pagination
    if (page < 1 || page > this.state.pageCount()) {
      return;
    }

    this.state.page.set(page);
    this.pageChange.emit(page);
  }
}
