import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  numberAttribute,
} from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectPaginationState } from '../pagination/pagination-state';

/**
 * The `NgpPaginationButton` directive is used to create a pagination button.
 */
@Directive({
  selector: '[ngpPaginationButton]',
  exportAs: 'ngpPaginationButton',
  host: {
    '[attr.data-page]': 'page()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.aria-current]': 'selected()',
  },
})
export class NgpPaginationButton {
  /**
   * Access the pagination state.
   */
  protected readonly paginationState = injectPaginationState();

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
  readonly disabled = computed(() => this.buttonDisabled() || this.paginationState().disabled());

  /**
   * Whether this page is the currently selected page.
   */
  protected readonly selected = computed(() => this.page() === this.paginationState().page());

  constructor() {
    ngpButton({ disabled: this.disabled, type: 'button' });
  }

  /**
   * Go to the page this button represents.
   */
  @HostListener('click')
  goToPage(): void {
    this.paginationState().goToPage(this.page());
  }

  /**
   * A click event may not be fired if this is on an anchor tag and the href is empty.
   * This is a workaround to ensure the click event is fired.
   *
   * @deprecated This was a workaround to ensure the click event is fired for 'enter' and 'space' keys
   * which now happens automatically in {@link ngpButton}.
   */
  protected onEnter(_event: Event): void {
    this.goToPage();
  }
}
