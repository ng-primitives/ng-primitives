import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpPaginationFirst } from './pagination-first-state';

/**
 * The `NgpPaginationFirst` directive is used to create a pagination button that navigates to the first page.
 */
@Directive({
  selector: '[ngpPaginationFirst]',
  exportAs: 'ngpPaginationFirst',
})
export class NgpPaginationFirst {
  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationFirstDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpPaginationFirst({
    buttonDisabled: this.buttonDisabled,
  });

  /**
   * Go to the first page.
   */
  goToFirstPage() {
    return this.state.goToFirstPage();
  }
}
