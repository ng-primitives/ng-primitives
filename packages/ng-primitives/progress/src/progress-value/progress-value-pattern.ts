import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { injectProgressPattern } from '../progress/progress-pattern';

/**
 * The state interface for the ProgressValue pattern.
 */
export interface NgpProgressValueState {
  // Empty state for now - all logic is handled via bindings
}

/**
 * The props interface for the ProgressValue pattern.
 */
export interface NgpProgressValueProps {
  /**
   * The element reference for the progress-value.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The ProgressValue pattern function.
 */
export function ngpProgressValuePattern({
  element = injectElementRef(),
}: NgpProgressValueProps = {}): NgpProgressValueState {
  const progressState = injectProgressPattern();

  // Set static aria-hidden attribute
  attrBinding(element, 'aria-hidden', () => 'true');

  // Setup data attribute bindings
  dataBinding(element, 'data-progressing', progressState.progressing);
  dataBinding(element, 'data-indeterminate', progressState.indeterminate);
  dataBinding(element, 'data-complete', progressState.complete);

  return {};
}

/**
 * The injection token for the ProgressValue pattern.
 */
export const NgpProgressValuePatternToken = new InjectionToken<NgpProgressValueState>(
  'NgpProgressValuePatternToken',
);

/**
 * Injects the ProgressValue pattern.
 */
export function injectProgressValuePattern(): NgpProgressValueState {
  return inject(NgpProgressValuePatternToken);
}

/**
 * Provides the ProgressValue pattern.
 */
export function provideProgressValuePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpProgressValueState,
): FactoryProvider {
  return { provide: NgpProgressValuePatternToken, useFactory: () => fn(inject(type)) };
}
