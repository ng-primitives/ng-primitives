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

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  }: NgpPromptComposerDictationProps): NgpPromptComposerDictationState => {
    const element = injectElementRef<HTMLElement>();
    const document = inject(DOCUMENT);
    const composer = injectPromptComposerState();

    const isDictating = computed(() => composer().isDictating());

    let recognition: any = null;

    // Store the prompt before dictation started
    let basePrompt = '';

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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        return;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous listening
      recognition.interimResults = true; // Enable interim results for live updates
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        composer().setDictating(true);
        // Store the current prompt as the base
        basePrompt = composer().prompt();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Combine base prompt with final transcript and interim transcript
        const separator = basePrompt ? ' ' : '';
        const newPrompt = basePrompt + separator + finalTranscript + interimTranscript;

        composer().setPrompt(newPrompt.trim());
      };

      recognition.onend = () => composer().setDictating(false);

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        composer().setDictating(false);
      };
    }

    function startDictation(): void {
      if (recognition && !composer().isDictating()) {
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
