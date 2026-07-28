import { DOCUMENT } from '@angular/common';
import { computed, inject, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { injectPromptComposerState } from '../prompt-composer/prompt-composer-state';

/** Used only when neither the consumer nor the page states a language. */
const DEFAULT_DICTATION_LANGUAGE = 'en-US';

export interface NgpPromptComposerDictationState {
  /**
   * Whether dictation is currently active.
   */
  readonly isDictating: Signal<boolean>;
}

export interface NgpPromptComposerDictationProps {
  /**
   * Whether the dictation button should be disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The BCP 47 language tag dictation transcribes in. Falls back to the page's own language.
   */
  readonly language?: Signal<string | undefined>;
}

export const [
  NgpPromptComposerDictationStateToken,
  ngpPromptComposerDictation,
  injectPromptComposerDictationState,
  providePromptComposerDictationState,
] = createPrimitive(
  'NgpPromptComposerDictation',
  ({
    disabled = signal(false),
    language = signal(undefined),
  }: NgpPromptComposerDictationProps): NgpPromptComposerDictationState => {
    const element = injectElementRef<HTMLElement>();
    const document = inject(DOCUMENT);
    const composer = injectPromptComposerState();

    const isDictating = computed(() => composer().isDictating());

    let recognition: any = null;

    // Store the prompt before dictation started
    let basePrompt = '';

    // The speech finalised so far this session, and how many results are already folded into it,
    // so a result is never counted twice.
    let finalTranscript = '';
    let finalisedCount = 0;

    // The last value dictation itself wrote, and how many results it was built from. Anything
    // else in the prompt is the user's own edit.
    let lastWritten: string | null = null;
    let writtenCount = 0;

    ngpButton({
      disabled: computed(() => disabled() || composer().dictationSupported === false),
    });

    // Host bindings
    attrBinding(element, 'type', 'button');
    dataBinding(element, 'data-dictating', isDictating);
    dataBinding(element, 'data-dictation-supported', () => composer().dictationSupported);
    dataBinding(element, 'data-prompt', () => composer().hasPrompt());

    // Listener
    listener(element, 'click', onClick);
    listener(document, 'keydown', onKeydown);

    onDestroy(() => {
      recognition?.stop();
      recognition = null;
    });

    function onClick(): void {
      if (!recognition) {
        console.warn('Speech recognition is not supported in this browser');
        return;
      }

      if (composer().isDictating()) {
        stopDictation();
      } else {
        startDictation();
      }
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && composer().isDictating()) {
        event.preventDefault();
        stopDictation();
      }
    }

    function initializeSpeechRecognition(): void {
      // read through globalThis, not window: this runs during construction, which is the one
      // phase the server executes, and referencing an undeclared `window` there is a ReferenceError
      const SpeechRecognition =
        (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous listening
      recognition.interimResults = true; // Enable interim results for live updates

      recognition.onstart = () => {
        composer().setDictating(true);
        // Store the current prompt as the base
        resetTranscript();
        basePrompt = composer().prompt();
      };

      recognition.onresult = (event: any) => {
        // a stray result after the session ended must not rewrite the field
        if (!composer().isDictating()) {
          return;
        }

        // The user has typed or deleted since we last wrote: take what they left as the new base
        // and drop the speech accumulated so far, so their edit wins instead of being overwritten.
        // Everything they had already seen counts as settled — including the phrase still in
        // flight, which would otherwise be re-applied when it finalises and undo their deletion.
        if (lastWritten !== null && composer().prompt() !== lastWritten) {
          basePrompt = composer().prompt();
          finalTranscript = '';
          finalisedCount = writtenCount;
        }

        let interimTranscript = '';

        // Fold in only the results not already accounted for. Re-reading the list from zero would
        // re-apply every phrase of the session on top of a base that may have moved on.
        for (let i = finalisedCount; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            finalisedCount = i + 1;
          } else {
            interimTranscript += transcript;
          }
        }

        // Combine base prompt with final transcript and interim transcript
        const separator = basePrompt ? ' ' : '';
        const newPrompt = (basePrompt + separator + finalTranscript + interimTranscript).trim();

        lastWritten = newPrompt;
        writtenCount = event.results.length;
        composer().setPrompt(newPrompt);
      };

      recognition.onend = () => {
        composer().setDictating(false);
        // the next session starts from whatever the prompt holds then, not from this one's base
        resetTranscript();
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        composer().setDictating(false);
      };
    }

    function resetTranscript(): void {
      basePrompt = '';
      finalTranscript = '';
      finalisedCount = 0;
      lastWritten = null;
      writtenCount = 0;
    }

    /**
     * The configured language, or the page's own: the document's `lang`, then the browser's.
     * Resolved per session so a language bound after construction is picked up.
     */
    function resolveLanguage(): string {
      return (
        language() ||
        document.documentElement.lang ||
        globalThis.navigator?.language ||
        DEFAULT_DICTATION_LANGUAGE
      );
    }

    function startDictation(): void {
      if (recognition && !composer().isDictating()) {
        recognition.lang = resolveLanguage();
        recognition.start();
      }
    }

    function stopDictation(): void {
      if (recognition && composer().isDictating()) {
        recognition.stop();
      }
    }

    initializeSpeechRecognition();

    return { isDictating } satisfies NgpPromptComposerDictationState;
  },
);
