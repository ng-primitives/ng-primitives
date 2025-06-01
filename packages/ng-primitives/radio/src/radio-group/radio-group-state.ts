import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpRadioGroup } from './radio-group';

/**
 * The state token  for the RadioGroup primitive.
 */
export const NgpRadioGroupStateToken = createStateToken<NgpRadioGroup<unknown>>('RadioGroup');

/**
 * Provides the RadioGroup state.
 */
export const provideRadioGroupState = createStateProvider(NgpRadioGroupStateToken);

/**
 * Injects the RadioGroup state.
 */
export const injectRadioGroupState = createStateInjector<NgpRadioGroup<unknown>>(
  NgpRadioGroupStateToken,
) as <T>() => InjectedState<NgpRadioGroup<T>>;

/**
 * The RadioGroup state registration function.
 */
export const radioGroupState = createState(NgpRadioGroupStateToken);
