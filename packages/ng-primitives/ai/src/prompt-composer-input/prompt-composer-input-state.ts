import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpPromptComposerInput } from './prompt-composer-input';

/**
 * The state token  for the PromptComposerInput primitive.
 */
export const NgpPromptComposerInputStateToken =
  createStateToken<NgpPromptComposerInput>('PromptComposerInput');

/**
 * Provides the PromptComposerInput state.
 */
export const providePromptComposerInputState = createStateProvider(
  NgpPromptComposerInputStateToken,
);

/**
 * Injects the PromptComposerInput state.
 */
export const injectPromptComposerInputState = createStateInjector<NgpPromptComposerInput>(
  NgpPromptComposerInputStateToken,
);

/**
 * The PromptComposerInput state registration function.
 */
export const promptComposerInputState = createState(NgpPromptComposerInputStateToken);
