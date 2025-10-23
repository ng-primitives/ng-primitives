import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { fromResizeEvent, injectElementRef } from 'ng-primitives/internal';
import { listener } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectThreadPattern } from '../thread/thread-pattern';

/**
 * The state interface for the ThreadViewport pattern.
 */
export interface NgpThreadViewportState {
  /**
   * ScrollToBottom method.
   */
  scrollToBottom: (behavior: ScrollBehavior) => void;
}

/**
 * The props interface for the ThreadViewport pattern.
 */
export interface NgpThreadViewportProps {
  /**
   * The element reference for the thread-viewport.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Threshold signal input.
   */
  readonly threshold?: Signal<number>;
  /**
   * AutoScroll signal input.
   */
  readonly autoScroll?: Signal<boolean>;
}

/**
 * The ThreadViewport pattern function.
 */
export function ngpThreadViewportPattern({
  element = injectElementRef(),
  threshold = signal(70),
  autoScroll = signal(true),
}: NgpThreadViewportProps = {}): NgpThreadViewportState {
  // Dependency injection
  const thread = injectThreadPattern();

  /** Store the last known scroll position */
  let lastScrollTop = 0;

  /** Determine if we are at the bottom of the scrollable container (within the threshold) */
  let isAtBottom = false;

  // Constructor logic
  // listen for scroll requests from the thread
  thread.scrollRequest
    .pipe(safeTakeUntilDestroyed())
    .subscribe(behavior => scrollToBottom(behavior));

  fromResizeEvent(element.nativeElement)
    .pipe(safeTakeUntilDestroyed())
    .subscribe(() => {
      if (isAtBottom) {
        scrollToBottom('instant');
      }
      onScroll();
    });

  listener(element, 'scroll', onScroll);

  // Method implementations
  function scrollToBottom(behavior: ScrollBehavior): void {
    if (!autoScroll()) {
      return;
    }

    element.nativeElement.scrollTo({
      top: element.nativeElement.scrollHeight,
      behavior,
    });
  }

  function onScroll(): void {
    const nativeElement = element.nativeElement;
    const isNowAtBottom =
      nativeElement.scrollHeight - nativeElement.scrollTop <=
      nativeElement.clientHeight + threshold();

    if (isNowAtBottom || lastScrollTop >= nativeElement.scrollTop) {
      isAtBottom = isNowAtBottom;
    }

    lastScrollTop = nativeElement.scrollTop;
  }

  return {
    scrollToBottom,
  };
}

/**
 * The injection token for the ThreadViewport pattern.
 */
export const NgpThreadViewportPatternToken = new InjectionToken<NgpThreadViewportState>(
  'NgpThreadViewportPatternToken',
);

/**
 * Injects the ThreadViewport pattern.
 */
export function injectThreadViewportPattern(): NgpThreadViewportState {
  return inject(NgpThreadViewportPatternToken);
}

/**
 * Provides the ThreadViewport pattern.
 */
export function provideThreadViewportPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpThreadViewportState,
): FactoryProvider {
  return { provide: NgpThreadViewportPatternToken, useFactory: () => fn(inject(type)) };
}
