import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  numberAttribute,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectPaginationState } from '../pagination/pagination-state';
import { injectPagination } from '../pagination/pagination-token';
import { NgpPaginationButtonToken } from './pagination-button-token';

/**
 * The `NgpPaginationButton` directive is used to create a pagination button.
 */
@Directive({
  selector: '[ngpPaginationButton]',
  exportAs: 'ngpPaginationButton',
  providers: [
    { provide: NgpPaginationButtonToken, useExisting: NgpPaginationButton },
    { provide: NgpDisabledToken, useExisting: NgpPaginationButton },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-page]': 'page()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.aria-current]': 'selected()',
  },
})
export class NgpPaginationButton implements NgpCanDisable {
  /**
   * Access the pagination.
   */
  protected readonly pagination = injectPagination();

  /**
   * Access the pagination state.
   */
  protected readonly state = injectPaginationState();

  /**
   * Define the page this button represents.
   */
  readonly page = input.required<number, NumberInput>({
    alias: 'ngpPaginationButtonPage',
    transform: numberAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationButtonDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly disabled = computed(() => this.buttonDisabled() || this.state().disabled());

  /**
   * Whether this page is the currently selected page.
   */
  protected readonly selected = computed(() => this.page() === this.state().page());

  /**
   * Go to the page this button represents.
   */
  @HostListener('click')
  goToPage(): void {
    if (this.disabled()) {
      return;
    }

    this.pagination.goToPage(this.page());
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
    this.goToPage();
  }
}
