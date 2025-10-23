import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectThreadPattern } from '../thread/thread-pattern';

/**
 * The state interface for the PromptComposer pattern.
 */
export interface NgpPromptComposerState {
  /**
   * Whether the prompt composer is currently dictating.
   */
  isDictating: WritableSignal<boolean>;
  /**
   * Whether dictation is supported by the browser.
   */
  dictationSupported: boolean;
  /**
   * Whether the prompt composer has a prompt.
   */
  hasPrompt: Signal<boolean>;
  /**
   * The current prompt text.
   */
  prompt: WritableSignal<string>;
  /**
   * SubmitPrompt method.
   */
  submitPrompt: () => void;
}

/**
 * The props interface for the PromptComposer pattern.
 */
export interface NgpPromptComposerProps {
  /**
   * The element reference for the prompt-composer.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Event listener for submit events.
   */
  readonly onSubmit?: (value: string) => void;
}

/**
 * The PromptComposer pattern function.
 */
export function ngpPromptComposerPattern({
  element = injectElementRef(),
  onSubmit,
}: NgpPromptComposerProps = {}): NgpPromptComposerState {
  // Dependency injection
  const thread = injectThreadPattern();

  // Signals and computed values
  const prompt = signal<string>('');
  const isDictating = signal<boolean>(false);
  const hasPrompt = computed(() => prompt().trim().length > 0);
  /** Whether dictation is supported by the browser */
  const dictationSupported = !!(
    (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition
  );
  // Host bindings
  dataBinding(element, 'data-prompt', hasPrompt);
  dataBinding(element, 'data-dictating', isDictating);
  dataBinding(element, 'data-dictation-supported', () => dictationSupported);

  // Method implementations
  function submitPrompt(): void {
    if (hasPrompt()) {
      onSubmit?.(prompt());
      prompt.set('');
      thread.scrollToBottom('smooth');
    }
  }

  return {
    isDictating,
    dictationSupported,
    hasPrompt,
    submitPrompt,
    prompt,
  };
}

/**
 * The injection token for the PromptComposer pattern.
 */
export const NgpPromptComposerPatternToken = new InjectionToken<NgpPromptComposerState>(
  'NgpPromptComposerPatternToken',
);

/**
 * Injects the PromptComposer pattern.
 */
export function injectPromptComposerPattern(): NgpPromptComposerState {
  return inject(NgpPromptComposerPatternToken);
}

/**
 * Provides the PromptComposer pattern.
 */
export function providePromptComposerPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpPromptComposerState,
): FactoryProvider {
  return { provide: NgpPromptComposerPatternToken, useFactory: () => fn(inject(type)) };
}
