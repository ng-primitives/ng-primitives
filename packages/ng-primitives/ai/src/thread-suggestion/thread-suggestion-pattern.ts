import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { onClick } from 'ng-primitives/state';
import { injectThreadPattern } from '../thread/thread-pattern';

/**
 * The state interface for the ThreadSuggestion pattern.
 */
export interface NgpThreadSuggestionState {
  /**
   * SubmitSuggestion method.
   */
  submitSuggestion: () => void;
}

/**
 * The props interface for the ThreadSuggestion pattern.
 */
export interface NgpThreadSuggestionProps {
  /**
   * The element reference for the thread-suggestion.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Suggestion signal input.
   */
  readonly suggestion?: Signal<string>;
  /**
   * SetPromptOnClick signal input.
   */
  readonly setPromptOnClick?: Signal<boolean>;
}

/**
 * The ThreadSuggestion pattern function.
 */
export function ngpThreadSuggestionPattern({
  element = injectElementRef(),
  suggestion = signal(''),
  setPromptOnClick = signal(true),
}: NgpThreadSuggestionProps = {}): NgpThreadSuggestionState {
  // Dependency injection
  const thread = injectThreadPattern();

  onClick(element, submitSuggestion);

  // Method implementations
  function submitSuggestion(): void {
    if (setPromptOnClick() && suggestion().length > 0) {
      thread.setPrompt(suggestion());
    }
  }

  return {
    submitSuggestion,
  };
}

/**
 * The injection token for the ThreadSuggestion pattern.
 */
export const NgpThreadSuggestionPatternToken = new InjectionToken<NgpThreadSuggestionState>(
  'NgpThreadSuggestionPatternToken',
);

/**
 * Injects the ThreadSuggestion pattern.
 */
export function injectThreadSuggestionPattern(): NgpThreadSuggestionState {
  return inject(NgpThreadSuggestionPatternToken);
}

/**
 * Provides the ThreadSuggestion pattern.
 */
export function provideThreadSuggestionPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpThreadSuggestionState,
): FactoryProvider {
  return { provide: NgpThreadSuggestionPatternToken, useFactory: () => fn(inject(type)) };
}
