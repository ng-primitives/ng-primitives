import { ngpSliderTrack } from 'ng-primitives/slider';
import { createPrimitive } from 'ng-primitives/state';

/**
 * Public state surface for the Color Slider Track primitive.
 */
export interface NgpColorSliderTrackState {}

/**
 * Inputs for configuring the Color Slider Track primitive.
 */
export interface NgpColorSliderTrackProps {}

export const [
  NgpColorSliderTrackStateToken,
  ngpColorSliderTrack,
  injectColorSliderTrackState,
  provideColorSliderTrackState,
] = createPrimitive(
  'NgpColorSliderTrack',
  ({}: NgpColorSliderTrackProps): NgpColorSliderTrackState => {
    // Compose the slider track: it registers the track element and handles pointer
    // interactions that set the value from the click position.
    ngpSliderTrack({});
    return {} satisfies NgpColorSliderTrackState;
  },
);
