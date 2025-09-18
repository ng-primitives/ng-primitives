import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpPromptComposerDictation } from './prompt-composer-dictation';

/**
 * The state token  for the PromptComposerDictation primitive.
 */
export const NgpPromptComposerDictationStateToken =
  createStateToken<NgpPromptComposerDictation>('PromptComposerDictation');

/**
 * Provides the PromptComposerDictation state.
 */
export const providePromptComposerDictationState = createStateProvider(
  NgpPromptComposerDictationStateToken,
);

/**
 * Injects the PromptComposerDictation state.
 */
export const injectPromptComposerDictationState = createStateInjector<NgpPromptComposerDictation>(
  NgpPromptComposerDictationStateToken,
);

/**
 * The PromptComposerDictation state registration function.
 */
export const promptComposerDictationState = createState(NgpPromptComposerDictationStateToken);
