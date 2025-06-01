import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpMeter } from './meter';

/**
 * The state token  for the Meter primitive.
 */
export const NgpMeterStateToken = createStateToken<NgpMeter>('Meter');

/**
 * Provides the Meter state.
 */
export const provideMeterState = createStateProvider(NgpMeterStateToken);

/**
 * Injects the Meter state.
 */
export const injectMeterState = createStateInjector<NgpMeter>(NgpMeterStateToken);

/**
 * The Meter state registration function.
 */
export const meterState = createState(NgpMeterStateToken);
