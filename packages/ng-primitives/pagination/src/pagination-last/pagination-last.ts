import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpPaginationLast } from './pagination-last-state';

/**
 * The `NgpPaginationLast` directive is used to create a pagination button that navigates to the last page.
 */
@Directive({
  selector: '[ngpPaginationLast]',
  exportAs: 'ngpPaginationLast',
})
export class NgpPaginationLast {
  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationLastDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpPaginationLast({
    disabled: this.disabled,
  });

  /**
   * Go to the last page.
   */
  goToLastPage(): void {
    this.state.goToLastPage();
  }
}
