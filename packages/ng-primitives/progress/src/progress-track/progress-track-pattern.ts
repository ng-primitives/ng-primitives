import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectProgressPattern } from '../progress/progress-pattern';

/**
 * The state interface for the ProgressTrack pattern.
 */
export interface NgpProgressTrackState {
  // Empty state for now - all logic is handled via bindings
}

/**
 * The props interface for the ProgressTrack pattern.
 */
export interface NgpProgressTrackProps {
  /**
   * The element reference for the progress-track.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The ProgressTrack pattern function.
 */
export function ngpProgressTrackPattern({
  element = injectElementRef(),
}: NgpProgressTrackProps = {}): NgpProgressTrackState {
  const progress = injectProgressPattern();

  // Setup data attribute bindings
  dataBinding(element, 'data-progressing', progress.progressing);
  dataBinding(element, 'data-indeterminate', progress.indeterminate);
  dataBinding(element, 'data-complete', progress.complete);

  return {};
}

/**
 * The injection token for the ProgressTrack pattern.
 */
export const NgpProgressTrackPatternToken = new InjectionToken<NgpProgressTrackState>(
  'NgpProgressTrackPatternToken',
);

/**
 * Injects the ProgressTrack pattern.
 */
export function injectProgressTrackPattern(): NgpProgressTrackState {
  return inject(NgpProgressTrackPatternToken);
}

/**
 * Provides the ProgressTrack pattern.
 */
export function provideProgressTrackPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpProgressTrackState,
): FactoryProvider {
  return { provide: NgpProgressTrackPatternToken, useFactory: () => fn(inject(type)) };
}
