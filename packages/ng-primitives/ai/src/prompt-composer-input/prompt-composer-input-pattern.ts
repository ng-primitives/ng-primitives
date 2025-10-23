import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { onPress } from 'ng-primitives/state';
import { fromEvent } from 'rxjs';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectPromptComposerPattern } from '../prompt-composer/prompt-composer-pattern';
import { injectThreadPattern } from '../thread/thread-pattern';

/**
 * The state interface for the PromptComposerInput pattern.
 */
export interface NgpPromptComposerInputState {
  // Define state properties and methods
}

/**
 * The props interface for the PromptComposerInput pattern.
 */
export interface NgpPromptComposerInputProps {
  /**
   * The element reference for the prompt-composer-input.
   */
  element?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;
}

/**
 * The PromptComposerInput pattern function.
 */
export function ngpPromptComposerInputPattern({
  element = injectElementRef<HTMLInputElement | HTMLTextAreaElement>(),
}: NgpPromptComposerInputProps = {}): NgpPromptComposerInputState {
  // Dependency injection
  const thread = injectThreadPattern();
  const composer = injectPromptComposerPattern();

  // set the initial state
  composer.prompt.set(element.nativeElement.value);

  // listen for requests to set the prompt
  thread.requestPrompt.pipe(safeTakeUntilDestroyed()).subscribe(value => {
    // set the cursor to the end
    composer.prompt.set(value);
    element.nativeElement.setSelectionRange(value.length, value.length);
    element.nativeElement.focus();
  });

  // listen for changes to the text content
  fromEvent(element.nativeElement, 'input')
    .pipe(safeTakeUntilDestroyed())
    .subscribe(() => composer.prompt.set(element.nativeElement.value));

  // any time the prompt changes, update the input value if needed
  explicitEffect([composer.prompt], ([prompt]) => (element.nativeElement.value = prompt));

  // Host bindings
  onPress(element, 'Enter', onEnterKey);

  // Method implementations
  function onEnterKey(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return;
    }

    event.preventDefault();

    // if there is no text content, do nothing
    if (element.nativeElement.value.trim().length === 0) {
      return;
    }

    composer.submitPrompt();
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the PromptComposerInput pattern.
 */
export const NgpPromptComposerInputPatternToken = new InjectionToken<NgpPromptComposerInputState>(
  'NgpPromptComposerInputPatternToken',
);

/**
 * Injects the PromptComposerInput pattern.
 */
export function injectPromptComposerInputPattern(): NgpPromptComposerInputState {
  return inject(NgpPromptComposerInputPatternToken);
}

/**
 * Provides the PromptComposerInput pattern.
 */
export function providePromptComposerInputPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpPromptComposerInputState,
): FactoryProvider {
  return { provide: NgpPromptComposerInputPatternToken, useFactory: () => fn(inject(type)) };
}
