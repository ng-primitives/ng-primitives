import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpNumberPicker } from './number-picker';

/**
 * The state token  for the NumberPicker primitive.
 */
export const NgpNumberPickerStateToken = createStateToken<NgpNumberPicker>('NumberPicker');

/**
 * Provides the NumberPicker state.
 */
export const provideNumberPickerState = createStateProvider(NgpNumberPickerStateToken);

/**
 * Injects the NumberPicker state.
 */
export const injectNumberPickerState = createStateInjector(NgpNumberPickerStateToken);

/**
 * The NumberPicker state registration function.
 */
export const numberPickerState = createState(NgpNumberPickerStateToken);
