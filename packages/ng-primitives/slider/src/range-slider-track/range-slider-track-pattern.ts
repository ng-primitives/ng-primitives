import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { injectRangeSliderPattern } from '../range-slider/range-slider-pattern';

/**
 * The state interface for the RangeSliderTrack pattern.
 */
export interface NgpRangeSliderTrackState {
  // Define state properties and methods
}

/**
 * The props interface for the RangeSliderTrack pattern.
 */
export interface NgpRangeSliderTrackProps {
  /**
   * The element reference for the range-slider-track.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The RangeSliderTrack pattern function.
 */
export function ngpRangeSliderTrackPattern({
  element = injectElementRef(),
}: NgpRangeSliderTrackProps = {}): NgpRangeSliderTrackState {
  // Dependency injection
  const rangeSlider = injectRangeSliderPattern();

  // Constructor logic
  rangeSlider.setTrack(element);

  // Host bindings
  dataBinding(element, 'data-orientation', rangeSlider.orientation);
  dataBinding(element, 'data-disabled', rangeSlider.disabled);
  listener(element, 'pointerdown', handlePointerDown);

  // Method implementations
  function handlePointerDown(event: PointerEvent): void {
    if (rangeSlider.disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position = rangeSlider.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (rangeSlider.orientation() === 'horizontal' ? rect.left : rect.top)) /
      (rangeSlider.orientation() === 'horizontal' ? rect.width : rect.height);

    // calculate the value based on the position
    const value = rangeSlider.min() + (rangeSlider.max() - rangeSlider.min()) * percentage;

    // determine which thumb to move based on proximity
    const closestThumb = rangeSlider.getClosestThumb(percentage * 100);

    if (closestThumb === 'low') {
      rangeSlider.setLowValue(value);
    } else {
      rangeSlider.setHighValue(value);
    }
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the RangeSliderTrack pattern.
 */
export const NgpRangeSliderTrackPatternToken = new InjectionToken<NgpRangeSliderTrackState>(
  'NgpRangeSliderTrackPatternToken',
);

/**
 * Injects the RangeSliderTrack pattern.
 */
export function injectRangeSliderTrackPattern(): NgpRangeSliderTrackState {
  return inject(NgpRangeSliderTrackPatternToken);
}

/**
 * Provides the RangeSliderTrack pattern.
 */
export function provideRangeSliderTrackPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRangeSliderTrackState,
): FactoryProvider {
  return { provide: NgpRangeSliderTrackPatternToken, useFactory: () => fn(inject(type)) };
}
