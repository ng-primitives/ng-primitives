import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives-state/state';
import type { NgpRadioGroup } from './radio-group';

/**
 * The state token  for the RadioGroup primitive.
 */
export const NgpRadioGroupStateToken = createStateToken<NgpRadioGroup>('RadioGroup');

/**
 * Provides the RadioGroup state.
 */
export const provideRadioGroupState = createStateProvider(NgpRadioGroupStateToken);

/**
 * Injects the RadioGroup state.
 */
export const injectRadioGroupState = createStateInjector(NgpRadioGroupStateToken);

/**
 * The RadioGroup state registration function.
 */
export const radioGroupState = createState(NgpRadioGroupStateToken);
