import { ElementRef, FactoryProvider, inject, InjectionToken, signal, Type } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

/**
 * The state interface for the Thread pattern.
 */
export interface NgpThreadState {
  /**
   * Scroll request subject.
   */
  scrollRequest: Subject<ScrollBehavior>;
  /**
   * Prompt request subject.
   */
  requestPrompt: Subject<string>;
  /**
   * ScrollToBottom method.
   */
  scrollToBottom: (behavior: ScrollBehavior) => void;
  /**
   * RegisterMessage method.
   */
  registerMessage: (id: string) => void;
  /**
   * UnregisterMessage method.
   */
  unregisterMessage: (id: string) => void;
  /**
   * IsLastMessage method.
   */
  isLastMessage: (id: string) => boolean;
  /**
   * SetPrompt method.
   */
  setPrompt: (value: string) => void;
}

/**
 * The props interface for the Thread pattern.
 */
export interface NgpThreadProps {
  /**
   * The element reference for the thread.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The Thread pattern function.
 */
export function ngpThreadPattern(): NgpThreadState {
  /** The storage for thread messages */
  const messages = signal<string[]>([]);

  /** Emit event to trigger scrolling to bottom */
  const scrollRequest = new Subject<ScrollBehavior>();

  /** Emit event to trigger setting the prompt */
  const requestPrompt = new Subject<string>();

  // Method implementations
  function scrollToBottom(behavior: ScrollBehavior): void {
    scrollRequest.next(behavior);
  }
  function registerMessage(message: string): void {
    messages.set([...messages(), message]);
  }
  function unregisterMessage(message: string): void {
    messages.set(messages().filter(m => m !== message));
  }
  function isLastMessage(message: string): boolean {
    return messages().length > 0 && messages()[messages().length - 1] === message;
  }

  function setPrompt(value: string): void {
    requestPrompt.next(value);
  }

  return {
    scrollToBottom,
    registerMessage,
    unregisterMessage,
    isLastMessage,
    setPrompt,
    scrollRequest,
    requestPrompt,
  };
}

/**
 * The injection token for the Thread pattern.
 */
export const NgpThreadPatternToken = new InjectionToken<NgpThreadState>('NgpThreadPatternToken');

/**
 * Injects the Thread pattern.
 */
export function injectThreadPattern(): NgpThreadState {
  return inject(NgpThreadPatternToken);
}

/**
 * Provides the Thread pattern.
 */
export function provideThreadPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpThreadState,
): FactoryProvider {
  return { provide: NgpThreadPatternToken, useFactory: () => fn(inject(type)) };
}
