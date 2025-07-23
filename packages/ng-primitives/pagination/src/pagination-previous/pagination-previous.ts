import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { setupButton } from 'ng-primitives/internal';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationPrevious` directive is used to create a pagination button that navigates to the previous page.
 */
@Directive({
  selector: '[ngpPaginationPrevious]',
  exportAs: 'ngpPaginationPrevious',
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-first-page]': 'paginationState().firstPage() ? "" : null',
  },
})
export class NgpPaginationPrevious {
  /**
   * Access the pagination state.
   */
  protected readonly paginationState = injectPaginationState();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationPreviousDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly disabled = computed(
    () =>
      this.buttonDisabled() ||
      this.paginationState().disabled() ||
      this.paginationState().firstPage(),
  );

  constructor() {
    setupButton({ disabled: this.disabled });
  }

  /**
   * Go to the previous page.
   */
  @HostListener('click')
  goToPreviousPage() {
    if (this.disabled()) {
      return;
    }

    this.paginationState().goToPage(this.paginationState().page() - 1);
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
    this.goToPreviousPage();
  }
}
