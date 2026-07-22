import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectThreadState } from '../thread/thread-state';

export interface NgpPromptComposerState {
  /**
   * The current prompt text.
   */
  readonly prompt: Signal<string>;
  /**
   * Whether the prompt input has content.
   */
  readonly hasPrompt: Signal<boolean>;
  /**
   * Whether the prompt is currently being dictated.
   */
  readonly isDictating: Signal<boolean>;
  /**
   * Whether dictation is supported by the browser.
   */
  readonly dictationSupported: boolean;
  /**
   * @internal
   * Set the current prompt text.
   */
  setPrompt(value: string): void;
  /**
   * @internal
   * Set whether the prompt is currently being dictated.
   */
  setDictating(value: boolean): void;
  /**
   * @internal
   * Submit the current prompt if there is content, and clear the input.
   */
  submitPrompt(): void;
}

export interface NgpPromptComposerProps {
  /**
   * Emits whenever the user submits the prompt.
   */
  readonly onSubmit?: (prompt: string) => void;
}

export const [
  NgpPromptComposerStateToken,
  ngpPromptComposer,
  injectPromptComposerState,
  providePromptComposerState,
] = createPrimitive(
  'NgpPromptComposer',
  ({ onSubmit }: NgpPromptComposerProps): NgpPromptComposerState => {
    const element = injectElementRef<HTMLElement>();
    const thread = injectThreadState();

    /** Store the current prompt text. */
    const prompt = signal<string>('');

    /** Track whether the prompt is currently being dictated. */
    const isDictating = signal<boolean>(false);

    /** Determine whether the prompt input has content. */
    const hasPrompt = computed(() => prompt().trim().length > 0);

    /** Whether dictation is supported by the browser. This is resolved once and never changes. */
    const dictationSupported = !!(
      (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition
    );

    // Host bindings
    dataBinding(element, 'data-prompt', hasPrompt);
    dataBinding(element, 'data-dictating', isDictating);
    dataBinding(element, 'data-dictation-supported', dictationSupported);

    function setPrompt(value: string): void {
      prompt.set(value);
    }

    function setDictating(value: boolean): void {
      isDictating.set(value);
    }

    function submitPrompt(): void {
      if (!hasPrompt()) {
        return;
      }

      onSubmit?.(prompt());
      prompt.set('');
      thread().scrollToBottom('smooth');
    }

    return {
      prompt: prompt.asReadonly(),
      hasPrompt,
      isDictating: isDictating.asReadonly(),
      dictationSupported,
      setPrompt,
      setDictating,
      submitPrompt,
    } satisfies NgpPromptComposerState;
  },
);
