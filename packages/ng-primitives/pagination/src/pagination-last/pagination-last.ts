import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton, syncButton } from 'ng-primitives/button';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationLast` directive is used to create a pagination button that navigates to the last page.
 */
@Directive({
  selector: '[ngpPaginationLast]',
  exportAs: 'ngpPaginationLast',
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-last-page]': 'paginationState().lastPage() ? "" : null',
  },
})
export class NgpPaginationLast {
  /**
   * Access the pagination state.
   */
  private readonly paginationState = injectPaginationState();

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
    syncButton({ disabled: this.disabled });
  }

  /**
   * Go to the last page.
   */
  @HostListener('click')
  goToLastPage(): void {
    if (this.disabled()) {
      return;
    }

    this.paginationState().goToPage(this.paginationState().pageCount());
  }

  /**
   * A click event may not be fired if this is on an anchor tag and the href is empty.
   * This is a workaround to ensure the click event is fired.
   */
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.goToLastPage();
  }
}
