import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpPromptComposer } from './prompt-composer';

/**
 * The state token  for the PromptComposer primitive.
 */
export const NgpPromptComposerStateToken = createStateToken<NgpPromptComposer>('PromptComposer');

/**
 * Provides the PromptComposer state.
 */
export const providePromptComposerState = createStateProvider(NgpPromptComposerStateToken);

/**
 * Injects the PromptComposer state.
 */
export const injectPromptComposerState = createStateInjector<NgpPromptComposer>(
  NgpPromptComposerStateToken,
);

/**
 * The PromptComposer state registration function.
 */
export const promptComposerState = createState(NgpPromptComposerStateToken);
