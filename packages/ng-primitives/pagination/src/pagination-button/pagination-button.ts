import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpPaginationButton } from './pagination-button-state';

/**
 * The `NgpPaginationButton` directive is used to create a pagination button.
 */
@Directive({
  selector: '[ngpPaginationButton]',
  exportAs: 'ngpPaginationButton',
})
export class NgpPaginationButton {
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
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationButtonDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpPaginationButton({
    page: this.page,
    disabled: this.disabled,
  });

  /**
   * Go to the page this button represents.
   */
  goToPage(): void {
    return this.state.goToPage();
  }
}
