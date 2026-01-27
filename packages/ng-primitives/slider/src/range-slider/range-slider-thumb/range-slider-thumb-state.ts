import { DOCUMENT } from '@angular/common';
import { computed, inject, Injector, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
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
export interface NgpRangeSliderThumbProps {
  /**
   * Callback fired when dragging starts.
   */
  readonly onDragStart?: () => void;
  /**
   * Callback fired when dragging ends.
   */
  readonly onDragEnd?: () => void;
}

export const [
  NgpRangeSliderThumbStateToken,
  ngpRangeSliderThumb,
  injectRangeSliderThumbState,
  provideRangeSliderThumbState,
] = createPrimitive(
  'NgpRangeSliderThumb',
  ({ onDragStart, onDragEnd }: NgpRangeSliderThumbProps) => {
    const element = injectElementRef();
    const rangeSlider = injectRangeSliderState();
    const injector = inject(Injector);
    const document = inject(DOCUMENT);

    // Store dragging state
    let dragging = false;
    let activePointerId: number | null = null;
    let cleanupDocumentListeners: (() => void)[] = [];

    // Determine which thumb this is based on registration order
    const thumb = computed(() => (rangeSlider().thumbs().indexOf(element) === 0 ? 'low' : 'high'));

    const value = computed(() => (thumb() === 'low' ? rangeSlider().low() : rangeSlider().high()));

    const percentage = computed(() =>
      thumb() === 'low' ? rangeSlider().lowPercentage() : rangeSlider().highPercentage(),
    );

    ngpButton({
      disabled: rangeSlider().disabled,
      role: 'slider',
      type: 'button',
    });

    // Host bindings
    attrBinding(element, 'aria-valuemin', () => rangeSlider().min());
    attrBinding(element, 'aria-valuemax', () => rangeSlider().max());
    attrBinding(element, 'aria-valuenow', value);
    attrBinding(element, 'aria-orientation', () => rangeSlider().orientation());
    dataBinding(element, 'data-orientation', () => rangeSlider().orientation());
    dataBinding(element, 'data-thumb', thumb);
    styleBinding(element, 'inset-inline-start.%', () =>
      rangeSlider().orientation() === 'horizontal' ? percentage() : null,
    );
    styleBinding(element, 'inset-block-start.%', () =>
      rangeSlider().orientation() === 'vertical' ? 100 - percentage() : null,
    );

    /**
     * Initiates a thumb drag: prevents default, marks dragging active, calls `onDragStart`, and attaches document-level pointer listeners.
     *
     * If the parent slider is disabled, the function no-ops after preventing the default event. Otherwise it replaces any existing document listeners with new move/up/cancel listeners and stores their cleanup functions.
     *
     * @param event - The pointerdown event that started the drag
     */
    function handlePointerDown(event: PointerEvent): void {
      event.preventDefault();

      if (rangeSlider().disabled()) {
        return;
      }

      dragging = true;
      activePointerId = event.pointerId;
      onDragStart?.();

      // Clean up any existing listeners
      cleanupDocumentListeners.forEach(cleanup => cleanup());

      // Set up document-level listeners to handle pointer events anywhere
      const pointerMoveCleanup = listener(document, 'pointermove', handlePointerMove, {
        config: false,
        injector,
      });

      const pointerUpCleanup = listener(document, 'pointerup', handlePointerEnd, {
        config: false,
        injector,
      });

      const pointerCancelCleanup = listener(document, 'pointercancel', handlePointerEnd, {
        config: false,
        injector,
      });

      cleanupDocumentListeners = [pointerMoveCleanup, pointerUpCleanup, pointerCancelCleanup];
    }

    function handlePointerEnd(event: PointerEvent): void {
      if (event.pointerId !== activePointerId) {
        return;
      }

      dragging = false;
      activePointerId = null;
      onDragEnd?.();
      cleanupDocumentListeners.forEach(cleanup => cleanup());
      cleanupDocumentListeners = [];
    }

    /**
     * Update the thumb's value from a pointer event while dragging.
     *
     * Computes the pointer position relative to the slider track (inverting vertical coordinates so bottom = 0%, top = 100%), clamps it to [0, 100], maps it into the slider's value range, and sets the corresponding low or high value on the parent slider.
     *
     * @param event - The pointer event used to compute the new thumb position and value
     */
    function handlePointerMove(event: PointerEvent): void {
      if (rangeSlider().disabled() || !dragging || event.pointerId !== activePointerId) {
        return;
      }

      const track = rangeSlider().track();
      if (!track) {
        return;
      }

      const rect = track.nativeElement.getBoundingClientRect();

      // Calculate the pointer position as a percentage of the track
      // p.ex. for horizontal: (pointerX - trackLeft) / trackWidth
      // For vertical, invert so bottom = 0%, top = 100%
      const isHorizontal = rangeSlider().orientation() === 'horizontal';
      const rawPercentage = isHorizontal
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100;
      const percentage = isHorizontal ? rawPercentage : 100 - rawPercentage;

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
    listener(element, 'keydown', handleKeydown);

    // Register thumb with parent
    rangeSlider().addThumb(element);

    // Cleanup on destroy
    onDestroy(() => rangeSlider().removeThumb(element));

    return {
      thumb,
      value,
      percentage,
    } satisfies NgpRangeSliderThumbState;
  },
);
