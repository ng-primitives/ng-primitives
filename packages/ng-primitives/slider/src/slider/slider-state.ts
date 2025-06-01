import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpSlider } from './slider';

/**
 * The state token  for the Slider primitive.
 */
export const NgpSliderStateToken = createStateToken<NgpSlider>('Slider');

/**
 * Provides the Slider state.
 */
export const provideSliderState = createStateProvider(NgpSliderStateToken);

/**
 * Injects the Slider state.
 */
export const injectSliderState = createStateInjector<NgpSlider>(NgpSliderStateToken);

/**
 * The Slider state registration function.
 */
export const sliderState = createState(NgpSliderStateToken);
