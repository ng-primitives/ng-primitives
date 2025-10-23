import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { injectSliderPattern } from '../slider/slider-pattern';

/**
 * The state interface for the SliderTrack pattern.
 */
export interface NgpSliderTrackState {
  // Define state properties and methods
}

/**
 * The props interface for the SliderTrack pattern.
 */
export interface NgpSliderTrackProps {
  /**
   * The element reference for the slider-track.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The SliderTrack pattern function.
 */
export function ngpSliderTrackPattern({
  element = injectElementRef(),
}: NgpSliderTrackProps = {}): NgpSliderTrackState {
  // Dependency injection
  const slider = injectSliderPattern();

  // Constructor logic
  slider.setTrack(element);

  // Host bindings
  dataBinding(element, 'data-orientation', slider.orientation);
  dataBinding(element, 'data-disabled', slider.disabled);
  listener(element, 'pointerdown', handlePointerDown);

  // Method implementations
  function handlePointerDown(event: PointerEvent): void {
    if (slider.disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position = slider.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (slider.orientation() === 'horizontal' ? rect.left : rect.top)) /
      (slider.orientation() === 'horizontal' ? rect.width : rect.height);

    // update the value based on the position
    slider.setValue(slider.min() + (slider.max() - slider.min()) * percentage);
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the SliderTrack pattern.
 */
export const NgpSliderTrackPatternToken = new InjectionToken<NgpSliderTrackState>(
  'NgpSliderTrackPatternToken',
);

/**
 * Injects the SliderTrack pattern.
 */
export function injectSliderTrackPattern(): NgpSliderTrackState {
  return inject(NgpSliderTrackPatternToken);
}

/**
 * Provides the SliderTrack pattern.
 */
export function provideSliderTrackPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSliderTrackState,
): FactoryProvider {
  return { provide: NgpSliderTrackPatternToken, useFactory: () => fn(inject(type)) };
}
