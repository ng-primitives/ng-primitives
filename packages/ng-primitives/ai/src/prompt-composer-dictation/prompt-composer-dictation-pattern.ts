import { DOCUMENT } from '@angular/common';
import {
  computed,
  DestroyRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { ngpButtonPattern } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, listener, onClick } from 'ng-primitives/state';
import { injectPromptComposerPattern } from '../prompt-composer/prompt-composer-pattern';

/**
 * The state interface for the PromptComposerDictation pattern.
 */
export interface NgpPromptComposerDictationState {
  readonly isDictating: Signal<boolean>;
}

/**
 * The props interface for the PromptComposerDictation pattern.
 */
export interface NgpPromptComposerDictationProps {
  /**
   * The element reference for the prompt-composer-dictation.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
}

/**
 * The PromptComposerDictation pattern function.
 */
export function ngpPromptComposerDictationPattern({
  element = injectElementRef(),
  disabled = signal(false),
}: NgpPromptComposerDictationProps = {}): NgpPromptComposerDictationState {
  // Dependency injection
  const composer = injectPromptComposerPattern();
  const destroyRef = inject(DestroyRef);
  const document = inject(DOCUMENT);
  let recognition: any = null;

  // Signals and computed values
  const basePrompt = signal<string>('');
  const isDictating = computed(() => composer.isDictating());

  // Constructor logic
  ngpButtonPattern({
    disabled: computed(() => disabled() || composer.dictationSupported === false),
  });
  initializeSpeechRecognition();

  // Host bindings
  attrBinding(element, 'type', 'button');
  dataBinding(element, 'data-dictating', isDictating);
  dataBinding(element, 'data-dictation-supported', () => composer.dictationSupported);
  dataBinding(element, 'data-prompt', composer.hasPrompt);
  onClick(element, toggleDictation);
  listener(document.body, 'keydown', onKeydown);

  destroyRef.onDestroy(() => {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
  });

  // Method implementations
  function toggleDictation(): void {
    if (!recognition) {
      console.warn('Speech recognition is not supported in this browser');
      return;
    }

    if (composer.isDictating()) {
      stopDictation();
    } else {
      startDictation();
    }
  }
  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && composer.isDictating()) {
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
      composer.isDictating.set(true);
      // Store the current prompt as the base
      basePrompt.set(composer.prompt());
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
      const baseText = basePrompt();
      const separator = baseText ? ' ' : '';
      const newPrompt = baseText + separator + finalTranscript + interimTranscript;

      composer.prompt.set(newPrompt.trim());
    };

    recognition.onend = () => {
      composer.isDictating.set(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      composer.isDictating.set(false);
    };
  }
  function startDictation(): void {
    if (recognition && !composer.isDictating()) {
      recognition.start();
    }
  }
  function stopDictation(): void {
    if (recognition && composer.isDictating()) {
      recognition.stop();
    }
  }

  return {
    isDictating,
  };
}

/**
 * The injection token for the PromptComposerDictation pattern.
 */
export const NgpPromptComposerDictationPatternToken =
  new InjectionToken<NgpPromptComposerDictationState>('NgpPromptComposerDictationPatternToken');

/**
 * Injects the PromptComposerDictation pattern.
 */
export function injectPromptComposerDictationPattern(): NgpPromptComposerDictationState {
  return inject(NgpPromptComposerDictationPatternToken);
}

/**
 * Provides the PromptComposerDictation pattern.
 */
export function providePromptComposerDictationPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpPromptComposerDictationState,
): FactoryProvider {
  return { provide: NgpPromptComposerDictationPatternToken, useFactory: () => fn(inject(type)) };
}
