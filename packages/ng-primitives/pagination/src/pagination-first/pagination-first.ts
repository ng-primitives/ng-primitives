import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationFirst` directive is used to create a pagination button that navigates to the first page.
 */
@Directive({
  selector: '[ngpPaginationFirst]',
  exportAs: 'ngpPaginationFirst',
  host: {
    '[attr.data-first-page]': 'paginationState().firstPage() ? "" : null',
  },
})
export class NgpPaginationFirst {
  /**
   * Access the pagination state.
   */
  protected readonly paginationState = injectPaginationState();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationFirstDisabled',
    transform: booleanAttribute,
  });

  readonly disabled = computed(
    () =>
      this.buttonDisabled() ||
      this.paginationState().disabled() ||
      this.paginationState().firstPage(),
  );

  constructor() {
    ngpButton({ disabled: this.disabled, type: 'button' });
  }
  /**
   * Go to the first page.
   */
  @HostListener('click')
  goToFirstPage() {
    this.paginationState().goToPage(1);
  }

  /**
   * A click event may not be fired if this is on an anchor tag and the href is empty.
   * This is a workaround to ensure the click event is fired.
   *
   * @deprecated This was a workaround to ensure the click event is fired for 'enter' and 'space' keys
   * which now happens automatically in {@link ngpButton}.
   */
  protected onEnter(_event: Event): void {
    this.goToFirstPage();
  }
}
