import { Directive } from '@angular/core';
import { ngpSearch, provideSearchState } from './search-state';

/**
 * The `NgpSearch` directive is a container for the search field components.
 */
@Directive({
  selector: '[ngpSearch]',
  exportAs: 'ngpSearch',
  providers: [provideSearchState()],
})
export class NgpSearch {
  /**
   * The search field state.
   */
  private readonly state = ngpSearch();

  /**
   * Whether the input field is empty.
   * @internal
   */
  readonly empty = this.state.empty;

  /**
   * Clear the input field.
   */
  clear(): void {
    this.state.clear();
  }
}
