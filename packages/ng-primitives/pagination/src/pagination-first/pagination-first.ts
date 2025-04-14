import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectPaginationState } from '../pagination/pagination-state';
import { injectPagination } from '../pagination/pagination-token';
import { NgpPaginationFirstToken } from './pagination-first-token';

/**
 * The `NgpPaginationFirst` directive is used to create a pagination button that navigates to the first page.
 */
@Directive({
  selector: '[ngpPaginationFirst]',
  exportAs: 'ngpPaginationFirst',
  providers: [
    { provide: NgpPaginationFirstToken, useExisting: NgpPaginationFirst },
    { provide: NgpDisabledToken, useExisting: NgpPaginationFirst },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-first-page]': 'pagination.firstPage() ? "" : null',
  },
})
export class NgpPaginationFirst implements NgpCanDisable {
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
    alias: 'ngpPaginationFirstDisabled',
    transform: booleanAttribute,
  });

  readonly disabled = computed(
    () => this.buttonDisabled() || this.state().disabled() || this.pagination.firstPage(),
  );

  /**
   * Go to the first page.
   */
  @HostListener('click')
  goToFirstPage() {
    if (this.disabled()) {
      return;
    }

    this.pagination.goToPage(1);
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
    this.goToFirstPage();
  }
}
