import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { injectTabsetPattern } from '../tabset/tabset-pattern';

/**
 * The state interface for the TabList pattern.
 */
export interface NgpTabListState {
  // Define state properties and methods
}

/**
 * The props interface for the TabList pattern.
 */
export interface NgpTabListProps {
  /**
   * The element reference for the tab-list.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The TabList pattern function.
 */
export function ngpTabListPattern({
  element = injectElementRef(),
  // Add other props
}: NgpTabListProps = {}): NgpTabListState {
  const tabset = injectTabsetPattern();

  // Host bindings
  attrBinding(element, 'role', 'tablist');
  attrBinding(element, 'aria-orientation', tabset.orientation);
  dataBinding(element, 'data-orientation', tabset.orientation);

  return {};
}

/**
 * The injection token for the TabList pattern.
 */
export const NgpTabListPatternToken = new InjectionToken<NgpTabListState>('NgpTabListPatternToken');

/**
 * Injects the TabList pattern.
 */
export function injectTabListPattern(): NgpTabListState {
  return inject(NgpTabListPatternToken);
}

/**
 * Provides the TabList pattern.
 */
export function provideTabListPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpTabListState,
): FactoryProvider {
  return { provide: NgpTabListPatternToken, useFactory: () => fn(inject(type)) };
}
