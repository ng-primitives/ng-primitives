import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { setupButton } from 'ng-primitives/internal';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationNext` directive is used to create a pagination button that navigates to the next page.
 */
@Directive({
  selector: '[ngpPaginationNext]',
  exportAs: 'ngpPaginationNext',
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-last-page]': 'paginationState().lastPage() ? "" : null',
  },
})
export class NgpPaginationNext {
  /**
   * Access the pagination state.
   */
  protected readonly paginationState = injectPaginationState();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationNextDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly disabled = computed(
    () =>
      this.buttonDisabled() ||
      this.paginationState().disabled() ||
      this.paginationState().lastPage(),
  );

  constructor() {
    setupButton({ disabled: this.disabled });
  }

  /**
   * Go to the next page.
   */
  @HostListener('click')
  goToNextPage(): void {
    if (this.disabled()) {
      return;
    }

    this.paginationState().goToPage(this.paginationState().page() + 1);
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
    this.goToNextPage();
  }
}
