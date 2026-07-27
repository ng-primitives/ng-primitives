import { signal, Signal } from '@angular/core';
import { fromResizeEvent, injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectThreadState } from '../thread/thread-state';

export interface NgpThreadViewportState {
  /**
   * @internal
   * Scroll the viewport to the bottom.
   */
  scrollToBottom(behavior: ScrollBehavior): void;
  /**
   * @internal
   * Scroll the viewport to the bottom, but only if it is already at the bottom, so content
   * arriving while the user is reading further up does not pull them away from it.
   */
  autoScrollToBottom(behavior: ScrollBehavior): void;
}

export interface NgpThreadViewportProps {
  /**
   * Whether the thread should automatically scroll to the bottom when new content is added.
   */
  readonly autoScroll?: Signal<boolean>;
  /**
   * The distance in pixels from the bottom that is still considered "at the bottom".
   */
  readonly threshold?: Signal<number>;
}

export const [
  NgpThreadViewportStateToken,
  ngpThreadViewport,
  injectThreadViewportState,
  provideThreadViewportState,
] = createPrimitive(
  'NgpThreadViewport',
  ({
    autoScroll = signal(true),
    threshold = signal(70),
  }: NgpThreadViewportProps): NgpThreadViewportState => {
    const element = injectElementRef<HTMLElement>();
    const thread = injectThreadState();

    /** Store the last known scroll position */
    let lastScrollTop = 0;

    /** Determine if we are at the bottom of the scrollable container (within the threshold) */
    let isAtBottom = false;

    function scrollToBottom(behavior: ScrollBehavior): void {
      if (!autoScroll()) {
        return;
      }

      element.nativeElement.scrollTo({
        top: element.nativeElement.scrollHeight,
        behavior,
      });
    }

    function autoScrollToBottom(behavior: ScrollBehavior): void {
      // the user has scrolled away from the bottom, so leave them where they are
      if (!isAtBottom) {
        return;
      }

      scrollToBottom(behavior);
    }

    function onScroll(): void {
      const { scrollHeight, scrollTop, clientHeight } = element.nativeElement;
      const atBottom = scrollHeight - scrollTop - clientHeight <= threshold();

      if (atBottom || lastScrollTop >= scrollTop) {
        isAtBottom = atBottom;
      }

      lastScrollTop = scrollTop;
    }

    // Listener
    listener(element, 'scroll', onScroll);

    fromResizeEvent(element.nativeElement)
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => {
        autoScrollToBottom('instant');
        onScroll();
      });

    const state = { scrollToBottom, autoScrollToBottom } satisfies NgpThreadViewportState;

    thread().setViewport(state);
    onDestroy(() => thread().removeViewport(state));

    return state;
  },
);
