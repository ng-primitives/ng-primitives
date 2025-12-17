import { computed, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  styleBinding,
} from 'ng-primitives/state';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Public state surface for the RangeSliderThumb primitive.
 */
export interface NgpRangeSliderThumbState {
  /**
   * Which value this thumb controls ('low' or 'high').
   */
  readonly thumb: Signal<'low' | 'high'>;
  /**
   * The current value for this thumb.
   */
  readonly value: Signal<number>;
  /**
   * The current percentage for this thumb.
   */
  readonly percentage: Signal<number>;
}

/**
 * Inputs for configuring the RangeSliderThumb primitive.
 */
export interface NgpRangeSliderThumbProps {}

export const [
  NgpRangeSliderThumbStateToken,
  ngpRangeSliderThumb,
  injectRangeSliderThumbState,
  provideRangeSliderThumbState,
] = createPrimitive('NgpRangeSliderThumb', ({}: NgpRangeSliderThumbProps) => {
  const element = injectElementRef();
  const rangeSlider = injectRangeSliderState();

  // Store dragging state
  let dragging = false;

  // Determine which thumb this is based on registration order
  const thumb = computed(() => (rangeSlider().thumbs().indexOf(element) === 0 ? 'low' : 'high'));

  const value = computed(() => (thumb() === 'low' ? rangeSlider().low() : rangeSlider().high()));

  const percentage = computed(() =>
    thumb() === 'low' ? rangeSlider().lowPercentage() : rangeSlider().highPercentage(),
  );

  // Setup interactions
  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: rangeSlider().disabled,
  });

  // Host bindings
  attrBinding(element, 'role', 'slider');
  attrBinding(element, 'aria-valuemin', () => rangeSlider().min());
  attrBinding(element, 'aria-valuemax', () => rangeSlider().max());
  attrBinding(element, 'aria-valuenow', value);
  attrBinding(element, 'aria-orientation', () => rangeSlider().orientation());
  attrBinding(element, 'tabindex', () => (rangeSlider().disabled() ? -1 : 0));
  dataBinding(element, 'data-orientation', () => rangeSlider().orientation());
  dataBinding(element, 'data-disabled', () => rangeSlider().disabled());
  dataBinding(element, 'data-thumb', thumb);
  styleBinding(element, 'inset-inline-start.%', () =>
    rangeSlider().orientation() === 'horizontal' ? percentage() : null,
  );
  styleBinding(element, 'inset-block-start.%', () =>
    rangeSlider().orientation() === 'vertical' ? percentage() : null,
  );

  function handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (rangeSlider().disabled()) {
      return;
    }

    dragging = true;
  }

  function handlePointerUp(): void {
    if (rangeSlider().disabled()) {
      return;
    }

    dragging = false;
  }

  function handlePointerMove(event: PointerEvent): void {
    if (rangeSlider().disabled() || !dragging) {
      return;
    }

    const track = rangeSlider().track();
    if (!track) {
      return;
    }

    const rect = track.nativeElement.getBoundingClientRect();

    // Calculate the pointer position as a percentage of the track
    // p.ex. for horizontal: (pointerX - trackLeft) / trackWidth
    const percentage =
      rangeSlider().orientation() === 'horizontal'
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100;

    const min = rangeSlider().min();
    const max = rangeSlider().max();
    const rangeSize = max - min;

    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const computedValue = min + rangeSize * (clampedPercentage / 100);

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      rangeSlider().setLowValue(computedValue);
    } else {
      rangeSlider().setHighValue(computedValue);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const currentValue = value();
    const step = rangeSlider().step() * multiplier;

    // determine the document direction
    const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue - step, rangeSlider().max())
          : Math.max(currentValue - step, rangeSlider().min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, rangeSlider().min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue + step, rangeSlider().min())
          : Math.min(currentValue + step, rangeSlider().max());
        break;
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, rangeSlider().max());
        break;
      case 'Home':
        newValue = isRTL ? rangeSlider().max() : rangeSlider().min();
        break;
      case 'End':
        newValue = isRTL ? rangeSlider().min() : rangeSlider().max();
        break;
      default:
        return;
    }

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      rangeSlider().setLowValue(newValue);
    } else {
      rangeSlider().setHighValue(newValue);
    }

    event.preventDefault();
  }

  // Event listeners
  listener(element, 'pointerdown', handlePointerDown);
  listener(document, 'pointerup', handlePointerUp);
  listener(document, 'pointermove', handlePointerMove);
  listener(element, 'keydown', handleKeydown);

  // Register thumb with parent
  rangeSlider().addThumb(element);

  // Cleanup on destroy
  onDestroy(() => rangeSlider().removeThumb(element));

  return {
    thumb,
    value,
    percentage,
  };
});
