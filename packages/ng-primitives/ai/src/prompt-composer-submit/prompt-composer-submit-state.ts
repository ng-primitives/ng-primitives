import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpPromptComposerSubmit } from './prompt-composer-submit';

/**
 * The state token  for the PromptComposerSubmit primitive.
 */
export const NgpPromptComposerSubmitStateToken =
  createStateToken<NgpPromptComposerSubmit>('PromptComposerSubmit');

/**
 * Provides the PromptComposerSubmit state.
 */
export const providePromptComposerSubmitState = createStateProvider(
  NgpPromptComposerSubmitStateToken,
);

/**
 * Injects the PromptComposerSubmit state.
 */
export const injectPromptComposerSubmitState = createStateInjector<NgpPromptComposerSubmit>(
  NgpPromptComposerSubmitStateToken,
);

/**
 * The PromptComposerSubmit state registration function.
 */
export const promptComposerSubmitState = createState(NgpPromptComposerSubmitStateToken);
