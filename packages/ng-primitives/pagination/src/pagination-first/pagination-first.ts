import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton, syncButton } from 'ng-primitives/button';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationFirst` directive is used to create a pagination button that navigates to the first page.
 */
@Directive({
  selector: '[ngpPaginationFirst]',
  exportAs: 'ngpPaginationFirst',
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
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
    syncButton({ disabled: this.disabled });
  }
  /**
   * Go to the first page.
   */
  @HostListener('click')
  goToFirstPage() {
    if (this.disabled()) {
      return;
    }

    this.paginationState().goToPage(1);
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
