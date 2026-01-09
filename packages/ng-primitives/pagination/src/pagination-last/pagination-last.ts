import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationLast` directive is used to create a pagination button that navigates to the last page.
 */
@Directive({
  selector: '[ngpPaginationLast]',
  exportAs: 'ngpPaginationLast',
  host: {
    '[attr.data-last-page]': 'paginationState().lastPage() ? "" : null',
  },
})
export class NgpPaginationLast {
  /**
   * Access the pagination state.
   */
  protected readonly paginationState = injectPaginationState();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationLastDisabled',
    transform: booleanAttribute,
  });

  readonly disabled = computed(
    () =>
      this.buttonDisabled() ||
      this.paginationState().disabled() ||
      this.paginationState().lastPage(),
  );

  constructor() {
    ngpButton({ disabled: this.disabled });
  }

  /**
   * Go to the last page.
   */
  @HostListener('click')
  goToLastPage(): void {
    this.paginationState().goToPage(this.paginationState().pageCount());
  }
}
