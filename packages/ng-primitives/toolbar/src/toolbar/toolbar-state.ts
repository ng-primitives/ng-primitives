import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpToolbar } from './toolbar';

/**
 * The state token  for the Toolbar primitive.
 */
export const NgpToolbarStateToken = createStateToken<NgpToolbar>('Toolbar');

/**
 * Provides the Toolbar state.
 */
export const provideToolbarState = createStateProvider(NgpToolbarStateToken);

/**
 * Injects the Toolbar state.
 */
export const injectToolbarState = createStateInjector(NgpToolbarStateToken);

/**
 * The Toolbar state registration function.
 */
export const toolbarState = createState(NgpToolbarStateToken);
