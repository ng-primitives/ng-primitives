import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import { ngpPagination, providePaginationState } from './pagination-state';

/**
 * The `NgpPagination` directive is used to create a pagination control.
 */
@Directive({
  selector: '[ngpPagination]',
  exportAs: 'ngpPagination',
  providers: [providePaginationState()],
})
export class NgpPagination {
  /**
   * The currently selected page. Leave unset for uncontrolled usage, where the
   * internal state is seeded from `defaultPage`.
   */
  readonly page = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpPaginationPage',
    transform: numberAttribute,
  });

  /**
   * The default page for uncontrolled usage.
   * @default 1
   */
  readonly defaultPage = input<number, NumberInput>(1, {
    alias: 'ngpPaginationDefaultPage',
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
   * The control state for the pagination.
   * @internal
   */
  protected readonly state = ngpPagination({
    page: this.page,
    defaultPage: this.defaultPage,
    pageCount: this.pageCount,
    disabled: this.disabled,
    onPageChange: (value: number) => this.pageChange.emit(value),
  });

  /**
   * Go to the specified page.
   * @param page The page to go to.
   */
  goToPage(page: number) {
    return this.state.goToPage(page);
  }
}
