import { Directive, HostListener } from '@angular/core';
import { injectSearch } from '../search/search-token';
import { NgpSearchClearToken } from './search-clear-token';

@Directive({
  selector: '[ngpSearchClear]',
  exportAs: 'ngpSearchClear',
  providers: [{ provide: NgpSearchClearToken, useExisting: NgpSearchClear }],
  host: {
    '[tabindex]': '-1',
    '[attr.data-empty]': 'search.empty() ? "" : null',
  },
})
export class NgpSearchClear {
  /**
   * Access the Search instance.
   */
  protected readonly search = injectSearch();

  /**
   * Clear the input field.
   */
  @HostListener('click')
  protected clear(): void {
    this.search.clear();
  }
}
