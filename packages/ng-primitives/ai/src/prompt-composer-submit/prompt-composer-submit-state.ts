import { computed, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';

export interface NgpPromptComposerSubmitState {
  /**
   * Whether dictation is currently active.
   */
  readonly isDictating: Signal<boolean>;
}

export interface NgpPromptComposerSubmitProps {
  /**
   * Whether the submit button should be disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpPromptComposerSubmitStateToken,
  ngpPromptComposerSubmit,
  injectPromptComposerSubmitState,
  providePromptComposerSubmitState,
] = createPrimitive(
  'NgpPromptComposerSubmit',
  ({ disabled = signal(false) }: NgpPromptComposerSubmitProps): NgpPromptComposerSubmitState => {
    const element = injectElementRef<HTMLElement>();
    const composer = injectPromptComposerState();

    const isDictating = computed(() => composer().isDictating());

    // the button is disabled explicitly or whenever there is nothing to submit
    ngpButton({ disabled: computed(() => disabled() || composer().hasPrompt() === false) });

    // Host bindings
    attrBinding(element, 'type', 'button');
    dataBinding(element, 'data-prompt', () => composer().hasPrompt());
    dataBinding(element, 'data-dictating', isDictating);
    dataBinding(element, 'data-dictation-supported', () => composer().dictationSupported);

    // Listener
    listener(element, 'click', () => composer().submitPrompt());

    return { isDictating } satisfies NgpPromptComposerSubmitState;
  },
);
