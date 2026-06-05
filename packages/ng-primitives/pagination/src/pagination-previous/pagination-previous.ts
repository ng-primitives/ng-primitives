import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpPaginationPrevious } from './pagination-previous-state';

/**
 * The `NgpPaginationPrevious` directive is used to create a pagination button that navigates to the previous page.
 */
@Directive({
  selector: '[ngpPaginationPrevious]',
  exportAs: 'ngpPaginationPrevious',
})
export class NgpPaginationPrevious {
  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationPreviousDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpPaginationPrevious({
    disabled: this.disabled,
  });

  /**
   * Go to the previous page.
   */
  goToPreviousPage() {
    return this.state.goToPreviousPage();
  }
}
