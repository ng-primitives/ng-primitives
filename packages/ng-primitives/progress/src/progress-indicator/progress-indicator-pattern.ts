import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, styleBinding } from 'ng-primitives/state';
import { injectProgressPattern } from '../progress/progress-pattern';

/**
 * The state interface for the ProgressIndicator pattern.
 */
export interface NgpProgressIndicatorState {
  percentage: Signal<number | null>;
}

/**
 * The props interface for the ProgressIndicator pattern.
 */
export interface NgpProgressIndicatorProps {
  /**
   * The element reference for the progress-indicator.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The ProgressIndicator pattern function.
 */
export function ngpProgressIndicatorPattern({
  element = injectElementRef(),
}: NgpProgressIndicatorProps = {}): NgpProgressIndicatorState {
  const progress = injectProgressPattern();

  // Derive the percentage
  const percentage = computed(() =>
    progress.value() === null
      ? null
      : ((progress.value()! - progress.min()) / (progress.max() - progress.min())) * 100,
  );

  // Add host bindings
  styleBinding(element, 'width.%', percentage);
  dataBinding(element, 'data-progressing', () => (progress.progressing() ? '' : null));
  dataBinding(element, 'data-indeterminate', () => (progress.indeterminate() ? '' : null));
  dataBinding(element, 'data-complete', () => (progress.complete() ? '' : null));

  return {
    percentage,
  };
}

/**
 * The injection token for the ProgressIndicator pattern.
 */
export const NgpProgressIndicatorPatternToken = new InjectionToken<NgpProgressIndicatorState>(
  'NgpProgressIndicatorPatternToken',
);

/**
 * Injects the ProgressIndicator pattern.
 */
export function injectProgressIndicatorPattern(): NgpProgressIndicatorState {
  return inject(NgpProgressIndicatorPatternToken);
}

/**
 * Provides the ProgressIndicator pattern.
 */
export function provideProgressIndicatorPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpProgressIndicatorState,
): FactoryProvider {
  return { provide: NgpProgressIndicatorPatternToken, useFactory: () => fn(inject(type)) };
}
