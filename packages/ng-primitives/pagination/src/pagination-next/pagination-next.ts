import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpPaginationNext } from './pagination-next-state';

/**
 * The `NgpPaginationNext` directive is used to create a pagination button that navigates to the next page.
 */
@Directive({
  selector: '[ngpPaginationNext]',
  exportAs: 'ngpPaginationNext',
})
export class NgpPaginationNext {
  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationNextDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpPaginationNext({
    buttonDisabled: this.buttonDisabled,
  });

  /**
   * Go to the next page.
   */
  goToNextPage(): void {
    return this.state.goToNextPage();
  }
}
