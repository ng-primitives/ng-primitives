import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpDialog } from './dialog';

/**
 * The state token  for the Dialog primitive.
 */
export const NgpDialogStateToken = createStateToken<NgpDialog>('Dialog');

/**
 * Provides the Dialog state.
 */
export const provideDialogState = createStateProvider(NgpDialogStateToken);

/**
 * Injects the Dialog state.
 */
export const injectDialogState = createStateInjector<NgpDialog>(NgpDialogStateToken);

/**
 * The Dialog state registration function.
 */
export const dialogState = createState(NgpDialogStateToken);
