import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpToggleGroup } from './toggle-group';

/**
 * The state token  for the ToggleGroup primitive.
 */
export const NgpToggleGroupStateToken = createStateToken<NgpToggleGroup>('ToggleGroup');

/**
 * Provides the ToggleGroup state.
 */
export const provideToggleGroupState = createStateProvider(NgpToggleGroupStateToken);

/**
 * Injects the ToggleGroup state.
 */
export const injectToggleGroupState = createStateInjector(NgpToggleGroupStateToken);

/**
 * The ToggleGroup state registration function.
 */
export const toggleGroupState = createState(NgpToggleGroupStateToken);
