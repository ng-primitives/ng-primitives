import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectSliderState } from '../slider/slider-state';

/**
 * Public state surface for the Slider Track primitive.
 */
export interface NgpSliderTrackState {}

/**
 * Inputs for configuring the Slider Track primitive.
 */
export interface NgpSliderTrackProps {}

export const [
  NgpSliderTrackStateToken,
  ngpSliderTrack,
  injectSliderTrackState,
  provideSliderTrackState,
] = createPrimitive('NgpSliderTrack', ({}: NgpSliderTrackProps): NgpSliderTrackState => {
  const element = injectElementRef<HTMLElement>();
  const slider = injectSliderState();

  // Host bindings
  dataBinding(element, 'data-orientation', () => slider().orientation());
  dataBinding(element, 'data-disabled', () => slider().disabled());

  // Register track for thumb measurements
  slider().setTrack(element);

  // Listener for pointer interactions to set value
  listener(element, 'pointerdown', (event: PointerEvent) => {
    if (slider().disabled()) {
      return;
    }

    // prevent text selection
    event.preventDefault();

    const rect = element.nativeElement.getBoundingClientRect();
    const isHorizontal = slider().orientation() === 'horizontal';
    const position = isHorizontal ? event.clientX - rect.left : event.clientY - rect.top;
    const size = isHorizontal ? rect.width : rect.height;
    const rawPercentage = size === 0 ? 0 : position / size;
    // Invert percentage for vertical sliders so bottom = min, top = max
    const percentage = isHorizontal ? rawPercentage : 1 - rawPercentage;
    const value =
      slider().min() + (slider().max() - slider().min()) * Math.max(0, Math.min(1, percentage));

    slider().setValue(value);
  });

  return {} satisfies NgpSliderTrackState;
});
