import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';
import { injectThreadState } from '../thread/thread-state';

export interface NgpPromptComposerInputState {
  /**
   * @internal
   * Set the prompt text, moving the cursor to the end and focusing the input.
   */
  setPrompt(value: string): void;
}

export const [
  NgpPromptComposerInputStateToken,
  ngpPromptComposerInput,
  injectPromptComposerInputState,
  providePromptComposerInputState,
] = createPrimitive('NgpPromptComposerInput', (): NgpPromptComposerInputState => {
  const element = injectElementRef<HTMLInputElement | HTMLTextAreaElement>();
  const thread = injectThreadState();
  const composer = injectPromptComposerState();

  // set the initial state
  composer().setPrompt(element.nativeElement.value);

  // listen for changes to the text content
  listener(element, 'input', () => composer().setPrompt(element.nativeElement.value));

  /**
   * If the user presses Enter, the form will be submitted, unless they are holding Shift.
   * This primitive automatically handles that behavior.
   */
  listener(element, 'keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    // if there is no text content, do nothing
    if (element.nativeElement.value.trim().length === 0) {
      return;
    }

    composer().submitPrompt();
  });

  // any time the prompt changes, update the input value if needed
  explicitEffect([composer().prompt], ([prompt]) => (element.nativeElement.value = prompt));

  function setPrompt(value: string): void {
    composer().setPrompt(value);
    // write the value now rather than waiting for the effect above, so the cursor is
    // placed against the text we just set
    element.nativeElement.value = value;
    // set the cursor to the end
    element.nativeElement.setSelectionRange(value.length, value.length);
    element.nativeElement.focus();
  }

  const state = { setPrompt } satisfies NgpPromptComposerInputState;

  // the thread routes suggestions to the input that is currently registered
  thread().setPromptInput(state);
  onDestroy(() => thread().removePromptInput(state));

  return state;
});
