import { ElementRef, FactoryProvider, inject, InjectionToken, Signal, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { injectProgressPattern } from '../progress/progress-pattern';

/**
 * The state interface for the ProgressLabel pattern.
 */
export interface NgpProgressLabelState {
  /**
   * The unique identifier for the progress label.
   */
  id: Signal<string>;
}

/**
 * The props interface for the ProgressLabel pattern.
 */
export interface NgpProgressLabelProps {
  /**
   * The unique identifier for the progress label.
   */
  id: Signal<string>;
  /**
   * The element reference for the progress-label.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The ProgressLabel pattern function.
 */
export function ngpProgressLabelPattern({
  id,
  element = injectElementRef(),
}: NgpProgressLabelProps): NgpProgressLabelState {
  const progress = injectProgressPattern();

  // Setup data attribute bindings
  attrBinding(element, 'id', id);
  dataBinding(element, 'data-progressing', progress.progressing);
  dataBinding(element, 'data-indeterminate', progress.indeterminate);
  dataBinding(element, 'data-complete', progress.complete);

  return { id };
}

/**
 * The injection token for the ProgressLabel pattern.
 */
export const NgpProgressLabelPatternToken = new InjectionToken<NgpProgressLabelState>(
  'NgpProgressLabelPatternToken',
);

/**
 * Injects the ProgressLabel pattern.
 */
export function injectProgressLabelPattern(): NgpProgressLabelState {
  return inject(NgpProgressLabelPatternToken);
}

/**
 * Provides the ProgressLabel pattern.
 */
export function provideProgressLabelPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpProgressLabelState,
): FactoryProvider {
  return { provide: NgpProgressLabelPatternToken, useFactory: () => fn(inject(type)) };
}
