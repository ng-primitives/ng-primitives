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
    const step = slider.step() * multiplier;
    const currentValue = slider.value();

    // determine the document direction
    const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue + step, slider.max())
          : Math.max(currentValue - step, slider.min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, slider.min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue - step, slider.min())
          : Math.min(currentValue + step, slider.max());
        break;
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, slider.max());
        break;
      case 'Home':
        newValue = isRTL ? slider.max() : slider.min();
        break;
      case 'End':
        newValue = isRTL ? slider.min() : slider.max();
        break;
      default:
        return;
    }

    // if the value is the same, do not emit an event
    if (newValue === currentValue) {
      return;
    }

    slider.setValue(newValue);
    event.preventDefault();
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
