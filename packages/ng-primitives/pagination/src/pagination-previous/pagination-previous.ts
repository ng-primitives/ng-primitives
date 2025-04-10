import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectPaginationState } from '../pagination/pagination-state';
import { injectPagination } from '../pagination/pagination-token';
import { NgpPaginationPreviousToken } from './pagination-previous-token';

@Directive({
  selector: '[ngpPaginationPrevious]',
  exportAs: 'ngpPaginationPrevious',
  providers: [
    { provide: NgpPaginationPreviousToken, useExisting: NgpPaginationPrevious },
    { provide: NgpDisabledToken, useExisting: NgpPaginationPrevious },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-first-page]': 'pagination.firstPage() ? "" : null',
  },
})
export class NgpPaginationPrevious implements NgpCanDisable {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Access the pagination state.
   */
  protected readonly state = injectPaginationState();

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
    () => this.buttonDisabled() || this.state().disabled() || this.pagination.firstPage(),
  );

  /**
   * Go to the previous page.
   */
  @HostListener('click')
  goToPreviousPage() {
    if (this.disabled()) {
      return;
    }

    this.pagination.goToPage(this.state().page() - 1);
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
