import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Public state surface for the RangeSliderTrack primitive.
 */
export interface NgpRangeSliderTrackState {}

/**
 * Inputs for configuring the RangeSliderTrack primitive.
 */
export interface NgpRangeSliderTrackProps {}

export const [
  NgpRangeSliderTrackStateToken,
  ngpRangeSliderTrack,
  injectRangeSliderTrackState,
  provideRangeSliderTrackState,
] = createPrimitive('NgpRangeSliderTrack', ({}: NgpRangeSliderTrackProps) => {
  const element = injectElementRef<HTMLElement>();
  const rangeSlider = injectRangeSliderState();

  // Host bindings
  dataBinding(element, 'data-orientation', () => rangeSlider().orientation());
  dataBinding(element, 'data-disabled', () => rangeSlider().disabled());

  /**
   * Convert a pointer down on the track into a slider value and move the nearest thumb to that value.
   *
   * If the slider is disabled the function returns without action. For vertical orientation the pointer-to-value mapping is inverted so the bottom of the track corresponds to the minimum value. The nearest thumb ("low" or "high") is updated to the computed value.
   *
   * @param event - The pointer event originating from the user interaction
   */
  function handlePointerDown(event: PointerEvent): void {
    if (rangeSlider().disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const isHorizontal = rangeSlider().orientation() === 'horizontal';
    const max = rangeSlider().max();
    const min = rangeSlider().min();
    const position = isHorizontal ? event.clientX : event.clientY;
    const rect = element.nativeElement.getBoundingClientRect();

    const start = isHorizontal ? rect.left : rect.top;
    const size = isHorizontal ? rect.width : rect.height;
    const rawPercentage = (position - start) / size;
    // Invert percentage for vertical sliders so bottom = min, top = max
    const percentage = isHorizontal ? rawPercentage : 1 - rawPercentage;

    // calculate the value based on the position
    const value = min + (max - min) * percentage;

    // determine which thumb to move based on proximity
    const closestThumb = rangeSlider().getClosestThumb(percentage * 100);

    if (closestThumb === 'low') {
      rangeSlider().setLowValue(value);
    } else {
      rangeSlider().setHighValue(value);
    }
  }

  // Event listener
  listener(element, 'pointerdown', handlePointerDown);

  // Register track with parent
  rangeSlider().setTrack(element);

  return {} satisfies NgpRangeSliderTrackState;
});