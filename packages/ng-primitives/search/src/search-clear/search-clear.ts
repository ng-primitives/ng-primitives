import { Directive } from '@angular/core';
import { ngpSearchClear, provideSearchClearState } from './search-clear-state';

/**
 * The `NgpSearchClear` directive can be added to a button to clear the search field on click.
 */
@Directive({
  selector: '[ngpSearchClear]',
  exportAs: 'ngpSearchClear',
  providers: [provideSearchClearState()],
})
export class NgpSearchClear {
  /**
   * The search clear state.
   */
  private readonly state = ngpSearchClear();
}
