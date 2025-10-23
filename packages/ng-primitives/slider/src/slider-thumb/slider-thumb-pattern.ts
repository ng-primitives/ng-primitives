import { DOCUMENT } from '@angular/common';
import { computed, ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, listener, styleBinding } from 'ng-primitives/state';
import { injectSliderPattern } from '../slider/slider-pattern';

/**
 * The state interface for the SliderThumb pattern.
 */
export interface NgpSliderThumbState {
  // Define state properties and methods
}

/**
 * The props interface for the SliderThumb pattern.
 */
export interface NgpSliderThumbProps {
  /**
   * The element reference for the slider-thumb.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The SliderThumb pattern function.
 */
export function ngpSliderThumbPattern({
  element = injectElementRef(),
}: NgpSliderThumbProps = {}): NgpSliderThumbState {
  // Dependency injection
  const slider = injectSliderPattern();
  const document = inject(DOCUMENT);
  let dragging = false;

  // Constructor logic
  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: slider.disabled,
  });

  // Host bindings
  attrBinding(element, 'role', 'slider');
  attrBinding(element, 'aria-valuemin', slider.min);
  attrBinding(element, 'aria-valuemax', slider.max);
  attrBinding(element, 'aria-valuenow', slider.value);
  attrBinding(element, 'aria-orientation', slider.orientation);
  attrBinding(
    element,
    'tabindex',
    computed(() => (slider.disabled() ? -1 : 0)),
  );
  dataBinding(element, 'data-orientation', slider.orientation);
  dataBinding(element, 'data-disabled', slider.disabled);
  styleBinding(
    element,
    'inset-inline-start.%',
    computed(() => (slider.orientation() === 'horizontal' ? slider.percentage() : null)),
  );
  styleBinding(
    element,
    'inset-block-start.%',
    computed(() => (slider.orientation() === 'vertical' ? slider.percentage() : null)),
  );
  listener(element, 'pointerdown', handlePointerDown);
  listener(document.body, 'pointerup', handlePointerUp);
  listener(document.body, 'pointermove', handlePointerMove);
  listener(element, 'keydown', handleKeydown);

  // Method implementations
  function handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (slider.disabled()) {
      return;
    }

    dragging = true;
  }
  function handlePointerUp(): void {
    if (slider.disabled()) {
      return;
    }

    dragging = false;
  }
  function handlePointerMove(event: PointerEvent): void {
    if (slider.disabled() || !dragging) {
      return;
    }

    const rect = slider.track()?.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const percentage =
      slider.orientation() === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : 1 - (event.clientY - rect.top) / rect.height;

    const value =
      slider.min() + (slider.max() - slider.min()) * Math.max(0, Math.min(1, percentage));

    slider.setValue(value);
  }
  function handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const value = slider.value();

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        slider.setValue(Math.max(value - slider.step() * multiplier, slider.min()));
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        slider.setValue(Math.min(value + slider.step() * multiplier, slider.max()));
        event.preventDefault();
        break;
      case 'Home':
        slider.setValue(slider.min());
        event.preventDefault();
        break;
      case 'End':
        slider.setValue(slider.max());
        event.preventDefault();
        break;
    }
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the SliderThumb pattern.
 */
export const NgpSliderThumbPatternToken = new InjectionToken<NgpSliderThumbState>(
  'NgpSliderThumbPatternToken',
);

/**
 * Injects the SliderThumb pattern.
 */
export function injectSliderThumbPattern(): NgpSliderThumbState {
  return inject(NgpSliderThumbPatternToken);
}

/**
 * Provides the SliderThumb pattern.
 */
export function provideSliderThumbPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSliderThumbState,
): FactoryProvider {
  return { provide: NgpSliderThumbPatternToken, useFactory: () => fn(inject(type)) };
}
