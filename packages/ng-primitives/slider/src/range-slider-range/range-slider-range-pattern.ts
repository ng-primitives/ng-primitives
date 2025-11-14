import { computed, ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, styleBinding } from 'ng-primitives/state';
import { injectRangeSliderPattern } from '../range-slider/range-slider-pattern';

/**
 * The state interface for the RangeSliderRange pattern.
 */
export interface NgpRangeSliderRangeState {
  // Define state properties and methods
}

/**
 * The props interface for the RangeSliderRange pattern.
 */
export interface NgpRangeSliderRangeProps {
  /**
   * The element reference for the range-slider-range.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The RangeSliderRange pattern function.
 */
export function ngpRangeSliderRangePattern({
  element = injectElementRef(),
}: NgpRangeSliderRangeProps = {}): NgpRangeSliderRangeState {
  // Dependency injection
  const rangeSlider = injectRangeSliderPattern();

  // Host bindings
  dataBinding(element, 'data-orientation', rangeSlider.orientation);
  dataBinding(element, 'data-disabled', rangeSlider.disabled);
  styleBinding(
    element,
    'width.%',
    computed(() =>
      rangeSlider.orientation() === 'horizontal' ? rangeSlider.rangePercentage() : null,
    ),
  );
  styleBinding(
    element,
    'height.%',
    computed(() =>
      rangeSlider.orientation() === 'vertical' ? rangeSlider.rangePercentage() : null,
    ),
  );
  styleBinding(
    element,
    'inset-inline-start.%',
    computed(() =>
      rangeSlider.orientation() === 'horizontal' ? rangeSlider.lowPercentage() : null,
    ),
  );
  styleBinding(
    element,
    'inset-block-start.%',
    computed(() => (rangeSlider.orientation() === 'vertical' ? rangeSlider.lowPercentage() : null)),
  );

  return {
    // Return state object
  };
}

/**
 * The injection token for the RangeSliderRange pattern.
 */
export const NgpRangeSliderRangePatternToken = new InjectionToken<NgpRangeSliderRangeState>(
  'NgpRangeSliderRangePatternToken',
);

/**
 * Injects the RangeSliderRange pattern.
 */
export function injectRangeSliderRangePattern(): NgpRangeSliderRangeState {
  return inject(NgpRangeSliderRangePatternToken);
}

/**
 * Provides the RangeSliderRange pattern.
 */
export function provideRangeSliderRangePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRangeSliderRangeState,
): FactoryProvider {
  return { provide: NgpRangeSliderRangePatternToken, useFactory: () => fn(inject(type)) };
}
