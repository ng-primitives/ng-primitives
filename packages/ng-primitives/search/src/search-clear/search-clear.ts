import { Directive } from '@angular/core';
import { ngpSearchClearPattern, provideSearchClearPattern } from './search-clear-pattern';

/**
 * The `NgpSearchClear` directive is can be added to a button to clear the search field on click.
 */
@Directive({
  selector: '[ngpSearchClear]',
  exportAs: 'ngpSearchClear',
  providers: [provideSearchClearPattern(NgpSearchClear, instance => instance.pattern)],
})
export class NgpSearchClear {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSearchClearPattern({});

  /**
   * Clear the input field.
   */
  protected clear(): void {
    this.pattern.clear();
  }
}
