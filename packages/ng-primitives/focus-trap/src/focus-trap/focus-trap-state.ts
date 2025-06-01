import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpFocusTrap } from './focus-trap';

/**
 * The state token  for the FocusTrap primitive.
 */
export const NgpFocusTrapStateToken = createStateToken<NgpFocusTrap>('FocusTrap');

/**
 * Provides the FocusTrap state.
 */
export const provideFocusTrapState = createStateProvider(NgpFocusTrapStateToken);

/**
 * Injects the FocusTrap state.
 */
export const injectFocusTrapState = createStateInjector<NgpFocusTrap>(NgpFocusTrapStateToken);

/**
 * The FocusTrap state registration function.
 */
export const focusTrapState = createState(NgpFocusTrapStateToken);
