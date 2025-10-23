import { DOCUMENT } from '@angular/common';
import { computed, ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, listener, styleBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectRangeSliderPattern } from '../range-slider/range-slider-pattern';

/**
 * The state interface for the RangeSliderThumb pattern.
 */
export interface NgpRangeSliderThumbState {
  // Define state properties and methods
}

/**
 * The props interface for the RangeSliderThumb pattern.
 */
export interface NgpRangeSliderThumbProps {
  /**
   * The element reference for the range-slider-thumb.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The RangeSliderThumb pattern function.
 */
export function ngpRangeSliderThumbPattern({
  element = injectElementRef(),
}: NgpRangeSliderThumbProps = {}): NgpRangeSliderThumbState {
  // Dependency injection
  const rangeSlider = injectRangeSliderPattern();
  const document = inject(DOCUMENT);

  // Create a unique internal identity for this thumb - this is not used in the DOM
  const thumbId = uniqueId('ngp-range-slider-thumb');

  // Internal state
  let dragging = false;

  // Signals and computed values
  const thumb = computed(() => (rangeSlider.thumbs().indexOf(thumbId) === 0 ? 'low' : 'high'));
  const value = computed(() => (thumb() === 'low' ? rangeSlider.low() : rangeSlider.high()));
  const percentage = computed(() =>
    thumb() === 'low' ? rangeSlider.lowPercentage() : rangeSlider.highPercentage(),
  );

  // Constructor logic
  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: rangeSlider.disabled,
  });

  rangeSlider.addThumb(thumbId);

  // Host bindings
  attrBinding(element, 'role', 'slider');
  attrBinding(element, 'aria-valuemin', rangeSlider.min);
  attrBinding(element, 'aria-valuemax', rangeSlider.max);
  attrBinding(element, 'aria-valuenow', value);
  attrBinding(element, 'aria-orientation', rangeSlider.orientation);
  attrBinding(
    element,
    'tabindex',
    computed(() => (rangeSlider.disabled() ? -1 : 0)),
  );
  dataBinding(element, 'data-orientation', rangeSlider.orientation);
  dataBinding(element, 'data-disabled', rangeSlider.disabled);
  dataBinding(element, 'data-thumb', thumb);
  styleBinding(
    element,
    'inset-inline-start.%',
    computed(() => (rangeSlider.orientation() === 'horizontal' ? percentage() : null)),
  );
  styleBinding(
    element,
    'inset-block-start.%',
    computed(() => (rangeSlider.orientation() === 'vertical' ? percentage() : null)),
  );
  listener(element, 'pointerdown', handlePointerDown);
  listener(document.body, 'pointerup', handlePointerUp);
  listener(document.body, 'pointermove', handlePointerMove);
  listener(element, 'keydown', handleKeydown);

  // Method implementations
  function handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (rangeSlider.disabled()) {
      return;
    }

    dragging = true;
  }
  function handlePointerUp(): void {
    if (rangeSlider.disabled()) {
      return;
    }

    dragging = false;
  }
  function handlePointerMove(event: PointerEvent): void {
    if (rangeSlider.disabled() || !dragging) {
      return;
    }

    const rect = rangeSlider.track()?.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const percentage =
      rangeSlider.orientation() === 'horizontal'
        ? (event.clientX - rect.left) / rect.width
        : (event.clientY - rect.top) / rect.height;

    const value =
      rangeSlider.min() +
      (rangeSlider.max() - rangeSlider.min()) * Math.max(0, Math.min(1, percentage));

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      rangeSlider.setLowValue(value);
    } else {
      rangeSlider.setHighValue(value);
    }
  }
  function handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const currentValue = value();
    const step = rangeSlider.step() * multiplier;

    // determine the document direction
    const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue - step, rangeSlider.max())
          : Math.max(currentValue - step, rangeSlider.min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, rangeSlider.min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue + step, rangeSlider.min())
          : Math.min(currentValue + step, rangeSlider.max());
        break;
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, rangeSlider.max());
        break;
      case 'Home':
        newValue = isRTL ? rangeSlider.max() : rangeSlider.min();
        break;
      case 'End':
        newValue = isRTL ? rangeSlider.min() : rangeSlider.max();
        break;
      default:
        return;
    }

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      rangeSlider.setLowValue(newValue);
    } else {
      rangeSlider.setHighValue(newValue);
    }

    event.preventDefault();
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the RangeSliderThumb pattern.
 */
export const NgpRangeSliderThumbPatternToken = new InjectionToken<NgpRangeSliderThumbState>(
  'NgpRangeSliderThumbPatternToken',
);

/**
 * Injects the RangeSliderThumb pattern.
 */
export function injectRangeSliderThumbPattern(): NgpRangeSliderThumbState {
  return inject(NgpRangeSliderThumbPatternToken);
}

/**
 * Provides the RangeSliderThumb pattern.
 */
export function provideRangeSliderThumbPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRangeSliderThumbState,
): FactoryProvider {
  return { provide: NgpRangeSliderThumbPatternToken, useFactory: () => fn(inject(type)) };
}
