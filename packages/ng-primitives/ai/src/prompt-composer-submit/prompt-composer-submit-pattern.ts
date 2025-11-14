import {
  computed,
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
import { attrBinding, dataBinding, onClick } from 'ng-primitives/state';
import { injectPromptComposerPattern } from '../prompt-composer/prompt-composer-pattern';

/**
 * The state interface for the PromptComposerSubmit pattern.
 */
export interface NgpPromptComposerSubmitState {
  // Define state properties and methods
}

/**
 * The props interface for the PromptComposerSubmit pattern.
 */
export interface NgpPromptComposerSubmitProps {
  /**
   * The element reference for the prompt-composer-submit.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
}

/**
 * The PromptComposerSubmit pattern function.
 */
export function ngpPromptComposerSubmitPattern({
  element = injectElementRef(),
  disabled = signal(false),
}: NgpPromptComposerSubmitProps = {}): NgpPromptComposerSubmitState {
  // Dependency injection
  const composer = injectPromptComposerPattern();

  // Signals and computed values
  const isDictating = computed(() => composer.isDictating());

  // Constructor logic
  ngpButtonPattern({
    disabled: computed(() => disabled() || composer.hasPrompt() === false),
  });

  // Host bindings
  attrBinding(element, 'type', 'button');
  dataBinding(element, 'data-prompt', composer.hasPrompt);
  dataBinding(element, 'data-dictating', isDictating);
  dataBinding(element, 'data-dictation-supported', () => composer.dictationSupported);
  onClick(element, () => composer.submitPrompt());

  return {
    // Return state object
  };
}

/**
 * The injection token for the PromptComposerSubmit pattern.
 */
export const NgpPromptComposerSubmitPatternToken = new InjectionToken<NgpPromptComposerSubmitState>(
  'NgpPromptComposerSubmitPatternToken',
);

/**
 * Injects the PromptComposerSubmit pattern.
 */
export function injectPromptComposerSubmitPattern(): NgpPromptComposerSubmitState {
  return inject(NgpPromptComposerSubmitPatternToken);
}

/**
 * Provides the PromptComposerSubmit pattern.
 */
export function providePromptComposerSubmitPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpPromptComposerSubmitState,
): FactoryProvider {
  return { provide: NgpPromptComposerSubmitPatternToken, useFactory: () => fn(inject(type)) };
}
