import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, onClick } from 'ng-primitives/state';
import { injectSearchPattern } from '../search/search-pattern';

/**
 * The state interface for the SearchClear pattern.
 */
export interface NgpSearchClearState {
  /**
   * Clears the search input.
   */
  clear: () => void;
}

/**
 * The props interface for the SearchClear pattern.
 */
export interface NgpSearchClearProps {
  /**
   * The element reference for the search-clear.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The SearchClear pattern function.
 */
export function ngpSearchClearPattern({
  element = injectElementRef(),
}: NgpSearchClearProps = {}): NgpSearchClearState {
  // Dependency injection
  const search = injectSearchPattern();

  // Host bindings
  attrBinding(element, 'tabindex', -1);
  dataBinding(element, 'data-empty', search.empty);

  // Host listeners
  onClick(element, clear);

  // Method implementations
  function clear(): void {
    search.clear();
  }

  return {
    // Return state object
    clear,
  };
}

/**
 * The injection token for the SearchClear pattern.
 */
export const NgpSearchClearPatternToken = new InjectionToken<NgpSearchClearState>(
  'NgpSearchClearPatternToken',
);

/**
 * Injects the SearchClear pattern.
 */
export function injectSearchClearPattern(): NgpSearchClearState {
  return inject(NgpSearchClearPatternToken);
}

/**
 * Provides the SearchClear pattern.
 */
export function provideSearchClearPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSearchClearState,
): FactoryProvider {
  return { provide: NgpSearchClearPatternToken, useFactory: () => fn(inject(type)) };
}
