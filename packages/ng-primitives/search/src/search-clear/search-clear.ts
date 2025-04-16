import { Directive, HostListener } from '@angular/core';
import { injectSearchState } from '../search/search-state';

/**
 * The `NgpSearchClear` directive is can be added to a button to clear the search field on click.
 */
@Directive({
  selector: '[ngpSearchClear]',
  exportAs: 'ngpSearchClear',
  host: {
    '[tabindex]': '-1',
    '[attr.data-empty]': 'search().empty() ? "" : null',
  },
})
export class NgpSearchClear {
  /**
   * Access the Search instance.
   */
  protected readonly search = injectSearchState();

  /**
   * Clear the input field.
   */
  @HostListener('click')
  protected clear(): void {
    this.search().clear();
  }
}
