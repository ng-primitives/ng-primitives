import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener } from 'ng-primitives/state';
import { injectThreadState } from '../thread/thread-state';

export interface NgpThreadSuggestionState {
  /**
   * Populate the prompt with this suggestion.
   */
  submitSuggestion(): void;
}

export interface NgpThreadSuggestionProps {
  /**
   * The suggested text to display in the input field.
   */
  readonly suggestion?: Signal<string>;
  /**
   * Whether the suggestion should populate the prompt when clicked.
   */
  readonly setPromptOnClick?: Signal<boolean>;
}

export const [
  NgpThreadSuggestionStateToken,
  ngpThreadSuggestion,
  injectThreadSuggestionState,
  provideThreadSuggestionState,
] = createPrimitive(
  'NgpThreadSuggestion',
  ({
    suggestion = signal(''),
    setPromptOnClick = signal(true),
  }: NgpThreadSuggestionProps): NgpThreadSuggestionState => {
    const element = injectElementRef<HTMLElement>();
    const thread = injectThreadState();

    function submitSuggestion(): void {
      if (setPromptOnClick() && suggestion().length > 0) {
        thread().setPrompt(suggestion());
      }
    }

    // Listener
    listener(element, 'click', submitSuggestion);

    return { submitSuggestion } satisfies NgpThreadSuggestionState;
  },
);
