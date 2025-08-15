import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpRangeSlider } from './range-slider';

/**
 * The state token for the Range Slider primitive.
 */
export const NgpRangeSliderStateToken = createStateToken<NgpRangeSlider>('RangeSlider');

/**
 * Provides the Range Slider state.
 */
export const provideRangeSliderState = createStateProvider(NgpRangeSliderStateToken);

/**
 * Injects the Range Slider state.
 */
export const injectRangeSliderState = createStateInjector<NgpRangeSlider>(NgpRangeSliderStateToken);

/**
 * The Range Slider state registration function.
 */
export const rangeSliderState = createState(NgpRangeSliderStateToken);
