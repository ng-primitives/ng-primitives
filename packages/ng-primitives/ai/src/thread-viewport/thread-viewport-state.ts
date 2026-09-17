import { signal, Signal } from '@angular/core';
import { explicitEffect, fromResizeEvent, injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { skip } from 'rxjs/operators';
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
  scrollToBottomIfNeeded(behavior: ScrollBehavior): void;
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

    /**
     * Determine if we are at the bottom of the scrollable container (within the threshold).
     *
     * A thread opens pinned to its latest message, so this starts true and only
     * becomes false once the user scrolls away. It must not be inferred from an
     * initial measurement: the viewport is empty until its messages render, so an
     * early measurement reports "at the bottom" for any thread whatsoever, and a
     * later one reports "not at the bottom" for every thread long enough to scroll.
     */
    let isAtBottom = true;

    function scrollToBottom(behavior: ScrollBehavior): void {
      if (!autoScroll()) {
        return;
      }

      element.nativeElement.scrollTo({
        top: element.nativeElement.scrollHeight,
        behavior,
      });
    }

    function scrollToBottomIfNeeded(behavior: ScrollBehavior): void {
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

    // no scroll event fires when the threshold itself changes, so recompute against the new value
    explicitEffect([threshold], () => onScroll());

    // `skip(1)` drops the baseline measurement the observer emits on setup. Only an
    // actual size *change* should pull the viewport back down — reacting to the
    // baseline would scroll a thread the moment it renders, and running `onScroll`
    // against it would read a viewport that is already full and conclude the user
    // had scrolled away before they ever touched it.
    fromResizeEvent(element.nativeElement)
      .pipe(skip(1), safeTakeUntilDestroyed())
      .subscribe(() => {
        scrollToBottomIfNeeded('instant');
        onScroll();
      });

    const state = { scrollToBottom, scrollToBottomIfNeeded } satisfies NgpThreadViewportState;

    thread().setViewport(state);
    onDestroy(() => thread().removeViewport(state));

    return state;
  },
);
