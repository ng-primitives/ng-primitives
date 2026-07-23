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
}

export interface NgpThreadViewportProps {
  /**
   * Whether the thread should automatically scroll to the bottom when new content is added.
   */
  readonly autoScroll?: Signal<boolean>;
}

export const [
  NgpThreadViewportStateToken,
  ngpThreadViewport,
  injectThreadViewportState,
  provideThreadViewportState,
] = createPrimitive(
  'NgpThreadViewport',
  ({ autoScroll = signal(true) }: NgpThreadViewportProps): NgpThreadViewportState => {
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

    function onScroll(): void {
      const { scrollHeight, scrollTop, clientHeight } = element.nativeElement;
      const atBottom = scrollHeight - scrollTop <= clientHeight;

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
        if (isAtBottom) {
          scrollToBottom('instant');
        }
        onScroll();
      });

    const state = { scrollToBottom } satisfies NgpThreadViewportState;

    thread().setViewport(state);
    onDestroy(() => thread().removeViewport(state));

    return state;
  },
);
