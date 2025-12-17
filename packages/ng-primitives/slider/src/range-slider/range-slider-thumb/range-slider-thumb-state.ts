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
  const state = injectRangeSliderState();

  // Store dragging state
  let dragging = false;

  // Determine which thumb this is based on registration order
  const thumb = computed(() => (state().thumbs().indexOf(element) === 0 ? 'low' : 'high'));

  const value = computed(() => (thumb() === 'low' ? state().low() : state().high()));

  const percentage = computed(() =>
    thumb() === 'low' ? state().lowPercentage() : state().highPercentage(),
  );

  // Setup interactions
  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: state().disabled,
  });

  // Host bindings
  attrBinding(element, 'role', 'slider');
  attrBinding(element, 'aria-valuemin', () => state().min());
  attrBinding(element, 'aria-valuemax', () => state().max());
  attrBinding(element, 'aria-valuenow', value);
  attrBinding(element, 'aria-orientation', () => state().orientation());
  attrBinding(element, 'tabindex', () => (state().disabled() ? -1 : 0));
  dataBinding(element, 'data-orientation', () => state().orientation());
  dataBinding(element, 'data-disabled', () => (state().disabled() ? '' : null));
  dataBinding(element, 'data-thumb', thumb);
  styleBinding(element, 'inset-inline-start.%', () =>
    state().orientation() === 'horizontal' ? percentage() : null,
  );
  styleBinding(element, 'inset-block-start.%', () =>
    state().orientation() === 'vertical' ? percentage() : null,
  );

  function handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    if (state().disabled()) {
      return;
    }

    dragging = true;
  }

  function handlePointerUp(): void {
    if (state().disabled()) {
      return;
    }

    dragging = false;
  }

  function handlePointerMove(event: PointerEvent): void {
    if (state().disabled() || !dragging) {
      return;
    }

    const track = state().track();
    if (!track) {
      return;
    }

    const rect = track.element.nativeElement.getBoundingClientRect();

    // Calculate the pointer position as a percentage of the track
    // p.ex. for horizontal: (pointerX - trackLeft) / trackWidth
    const percentage =
      state().orientation() === 'horizontal'
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100;

    const min = state().min();
    const max = state().max();
    const rangeSize = max - min;

    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const computedValue = min + rangeSize * (clampedPercentage / 100);

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      state().setLowValue(computedValue);
    } else {
      state().setHighValue(computedValue);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;
    const currentValue = value();
    const step = state().step() * multiplier;

    // determine the document direction
    const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';

    let newValue: number;

    switch (event.key) {
      case 'ArrowLeft':
        newValue = isRTL
          ? Math.min(currentValue - step, state().max())
          : Math.max(currentValue - step, state().min());
        break;
      case 'ArrowDown':
        newValue = Math.max(currentValue - step, state().min());
        break;
      case 'ArrowRight':
        newValue = isRTL
          ? Math.max(currentValue + step, state().min())
          : Math.min(currentValue + step, state().max());
        break;
      case 'ArrowUp':
        newValue = Math.min(currentValue + step, state().max());
        break;
      case 'Home':
        newValue = isRTL ? state().max() : state().min();
        break;
      case 'End':
        newValue = isRTL ? state().min() : state().max();
        break;
      default:
        return;
    }

    // Update the appropriate value based on thumb type
    if (thumb() === 'low') {
      state().setLowValue(newValue);
    } else {
      state().setHighValue(newValue);
    }

    event.preventDefault();
  }

  // Event listeners
  listener(element, 'pointerdown', handlePointerDown);
  listener(document, 'pointerup', handlePointerUp);
  listener(document, 'pointermove', handlePointerMove);
  listener(element, 'keydown', handleKeydown);

  // Register thumb with parent
  state().addThumb(element as any);

  // Cleanup on destroy
  onDestroy(() => {
    state().removeThumb(element as any);
  });

  return {
    thumb,
    value,
    percentage,
  };
});
