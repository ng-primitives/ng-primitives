import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpTextarea } from './textarea';

/**
 * The state token  for the Textarea primitive.
 */
export const NgpTextareaStateToken = createStateToken<NgpTextarea>('Textarea');

/**
 * Provides the Textarea state.
 */
export const provideTextareaState = createStateProvider(NgpTextareaStateToken);

/**
 * Injects the Textarea state.
 */
export const injectTextareaState = createStateInjector<NgpTextarea>(NgpTextareaStateToken);

/**
 * The Textarea state registration function.
 */
export const textareaState = createState(NgpTextareaStateToken);
