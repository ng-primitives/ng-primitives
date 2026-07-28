import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectSearchState } from '../search/search-state';

export interface NgpSearchClearState {
  /**
   * Clear the search field.
   */
  clear(): void;
}

export const [
  NgpSearchClearStateToken,
  ngpSearchClear,
  injectSearchClearState,
  provideSearchClearState,
] = createPrimitive('NgpSearchClear', (): NgpSearchClearState => {
  const element = injectElementRef<HTMLElement>();
  const search = injectSearchState();

  // Host bindings
  attrBinding(element, 'tabindex', '-1');
  dataBinding(element, 'data-empty', search().empty);

  function clear(): void {
    search().clear();
  }

  listener(element, 'click', clear);

  return { clear } satisfies NgpSearchClearState;
});
