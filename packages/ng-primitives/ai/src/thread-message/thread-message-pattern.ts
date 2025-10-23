import {
  DestroyRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Type,
} from '@angular/core';
import { fromMutationObserver, injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { injectThreadPattern } from '../thread/thread-pattern';

/**
 * The state interface for the ThreadMessage pattern.
 */
export interface NgpThreadMessageState {
  messageId: string;
}

/**
 * The props interface for the ThreadMessage pattern.
 */
export interface NgpThreadMessageProps {
  /**
   * The element reference for the thread-message.
   */
  element?: ElementRef<HTMLElement>;
}

/**
 * The ThreadMessage pattern function.
 */
export function ngpThreadMessagePattern({
  element = injectElementRef(),
}: NgpThreadMessageProps = {}): NgpThreadMessageState {
  // Dependency injection
  const destroyRef = inject(DestroyRef);
  const thread = injectThreadPattern();
  const messageId = uniqueId('ngp-thread-message');

  // Constructor logic
  // Watch for content changes (like streaming text) and maintain scroll position
  fromMutationObserver(element.nativeElement, {
    childList: true, // Watch for new/removed child nodes
    subtree: true, // Watch changes in all descendants
    characterData: true, // Watch for text content changes in text nodes
    attributes: false, // We don't care about attribute changes for content streaming
  })
    .pipe(safeTakeUntilDestroyed())
    .subscribe(() => {
      // if this is the last message, scroll to bottom
      if (thread.isLastMessage(messageId)) {
        thread.scrollToBottom('smooth');
      }
    });

  thread.registerMessage(messageId);
  destroyRef.onDestroy(() => thread.unregisterMessage(messageId));

  return {
    messageId,
  };
}

/**
 * The injection token for the ThreadMessage pattern.
 */
export const NgpThreadMessagePatternToken = new InjectionToken<NgpThreadMessageState>(
  'NgpThreadMessagePatternToken',
);

/**
 * Injects the ThreadMessage pattern.
 */
export function injectThreadMessagePattern(): NgpThreadMessageState {
  return inject(NgpThreadMessagePatternToken);
}

/**
 * Provides the ThreadMessage pattern.
 */
export function provideThreadMessagePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpThreadMessageState,
): FactoryProvider {
  return { provide: NgpThreadMessagePatternToken, useFactory: () => fn(inject(type)) };
}
