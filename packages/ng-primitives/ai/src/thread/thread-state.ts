import { signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';
import type { NgpPromptComposerInputState } from '../prompt-composer-input/prompt-composer-input-state';
import type { NgpThreadMessageState } from '../thread-message/thread-message-state';
import type { NgpThreadViewportState } from '../thread-viewport/thread-viewport-state';

export interface NgpThreadState {
  /**
   * Scroll the thread viewport to the bottom.
   * @param behavior The scroll behavior to use.
   */
  scrollToBottom(behavior: ScrollBehavior): void;
  /**
   * Set the prompt text in the associated prompt composer.
   * @param value The prompt text.
   */
  setPrompt(value: string): void;
  /**
   * @internal
   * Register the viewport that scrolls this thread.
   */
  setViewport(viewport: NgpThreadViewportState): void;
  /**
   * @internal
   * Deregister the viewport that scrolls this thread.
   */
  removeViewport(viewport: NgpThreadViewportState): void;
  /**
   * @internal
   * Register the prompt input that receives the prompt text.
   */
  setPromptInput(input: NgpPromptComposerInputState): void;
  /**
   * @internal
   * Deregister the prompt input that receives the prompt text.
   */
  removePromptInput(input: NgpPromptComposerInputState): void;
  /**
   * @internal
   * Register a message with the thread.
   */
  registerMessage(message: NgpThreadMessageState): void;
  /**
   * @internal
   * Deregister a message from the thread.
   */
  unregisterMessage(message: NgpThreadMessageState): void;
  /**
   * @internal
   * Determine if the given message is the last message in the thread.
   */
  isLastMessage(message: NgpThreadMessageState): boolean;
}

export const [NgpThreadStateToken, ngpThread, injectThreadState, provideThreadState] =
  createPrimitive('NgpThread', (): NgpThreadState => {
    // The parts that carry out the thread's imperative work register themselves here, so the
    // thread can drive them directly rather than broadcasting requests they may not receive.
    const viewport = signal<NgpThreadViewportState | null>(null);
    const promptInput = signal<NgpPromptComposerInputState | null>(null);
    const messages = signal<NgpThreadMessageState[]>([]);

    function scrollToBottom(behavior: ScrollBehavior): void {
      viewport()?.scrollToBottom(behavior);
    }

    function setPrompt(value: string): void {
      promptInput()?.setPrompt(value);
    }

    function setViewport(value: NgpThreadViewportState): void {
      viewport.set(value);
    }

    function removeViewport(value: NgpThreadViewportState): void {
      // only clear if this viewport is still the active one, so a newer viewport that has
      // taken over isn't clobbered when an old one is torn down
      if (viewport() === value) {
        viewport.set(null);
      }
    }

    function setPromptInput(value: NgpPromptComposerInputState): void {
      promptInput.set(value);
    }

    function removePromptInput(value: NgpPromptComposerInputState): void {
      if (promptInput() === value) {
        promptInput.set(null);
      }
    }

    function registerMessage(message: NgpThreadMessageState): void {
      messages.update(current => [...current, message]);
    }

    function unregisterMessage(message: NgpThreadMessageState): void {
      messages.update(current => current.filter(m => m !== message));
    }

    function isLastMessage(message: NgpThreadMessageState): boolean {
      const current = messages();
      return current.length > 0 && current[current.length - 1] === message;
    }

    return {
      scrollToBottom,
      setPrompt,
      setViewport,
      removeViewport,
      setPromptInput,
      removePromptInput,
      registerMessage,
      unregisterMessage,
      isLastMessage,
    } satisfies NgpThreadState;
  });
