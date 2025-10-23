import { computed, ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, styleBinding } from 'ng-primitives/state';
import { injectSliderPattern } from '../slider/slider-pattern';

/**
 * The state interface for the SliderRange pattern.
 */
export interface NgpSliderRangeState {
  // Define state properties and methods
}

/**
 * The props interface for the SliderRange pattern.
 */
export interface NgpSliderRangeProps {
  /**
   * The element reference for the slider-range.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The SliderRange pattern function.
 */
export function ngpSliderRangePattern({
  element = injectElementRef(),
}: NgpSliderRangeProps = {}): NgpSliderRangeState {
  // Dependency injection
  const slider = injectSliderPattern();

  // Host bindings
  dataBinding(element, 'data-orientation', slider.orientation);
  dataBinding(element, 'data-disabled', slider.disabled);
  styleBinding(
    element,
    'width.%',
    computed(() => (slider.orientation() === 'horizontal' ? slider.percentage() : null)),
  );
  styleBinding(
    element,
    'height.%',
    computed(() => (slider.orientation() === 'vertical' ? slider.percentage() : null)),
  );

  return {
    // Return state object
  };
}

/**
 * The injection token for the SliderRange pattern.
 */
export const NgpSliderRangePatternToken = new InjectionToken<NgpSliderRangeState>(
  'NgpSliderRangePatternToken',
);

/**
 * Injects the SliderRange pattern.
 */
export function injectSliderRangePattern(): NgpSliderRangeState {
  return inject(NgpSliderRangePatternToken);
}

/**
 * Provides the SliderRange pattern.
 */
export function provideSliderRangePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSliderRangeState,
): FactoryProvider {
  return { provide: NgpSliderRangePatternToken, useFactory: () => fn(inject(type)) };
}
