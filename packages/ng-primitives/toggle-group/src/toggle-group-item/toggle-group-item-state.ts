import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpToggleGroupItem } from './toggle-group-item';

/**
 * The state token  for the ToggleGroupItem primitive.
 */
export const NgpToggleGroupItemStateToken = createStateToken<NgpToggleGroupItem>('ToggleGroupItem');

/**
 * Provides the ToggleGroupItem state.
 */
export const provideToggleGroupItemState = createStateProvider(NgpToggleGroupItemStateToken);

/**
 * Injects the ToggleGroupItem state.
 */
export const injectToggleGroupItemState = createStateInjector(NgpToggleGroupItemStateToken);

/**
 * The ToggleGroupItem state registration function.
 */
export const toggleGroupItemState = createState(NgpToggleGroupItemStateToken);
