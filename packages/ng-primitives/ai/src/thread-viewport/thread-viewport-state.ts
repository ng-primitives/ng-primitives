import { afterNextRender, signal, Signal } from '@angular/core';
import {
  explicitEffect,
  fromMutationObserver,
  fromResizeEvent,
  injectElementRef,
} from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener, onDestroy } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { filter, skip } from 'rxjs/operators';
import { injectThreadState } from '../thread/thread-state';
import {
  classifyAddedElements,
  compensatePrependedScroll,
  extractAddedElements,
} from './thread-viewport-scroll';

export interface NgpThreadViewportState {
  /**
   * Whether the viewport is currently scrolled to the bottom (within threshold).
   */
  readonly isAtBottom: Signal<boolean>;
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
  /** The position at which the thread viewport initially opens. */
  readonly initialScrollPosition?: Signal<'start' | 'end'>;
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
    initialScrollPosition = signal('end'),
    threshold = signal(70),
  }: NgpThreadViewportProps): NgpThreadViewportState => {
    const element = injectElementRef<HTMLElement>();
    const thread = injectThreadState();

    let lastScrollTop = 0;
    const isAtBottom = signal<boolean>(initialScrollPosition() === 'end');

    let hasRendered = false;

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
      if (!hasRendered || !isAtBottom()) {
        return;
      }

      scrollToBottom(behavior);
    }

    function onScroll(): void {
      const { scrollHeight, scrollTop, clientHeight } = element.nativeElement;
      isAtBottom.set(scrollHeight - scrollTop - clientHeight <= threshold());
      lastScrollTop = scrollTop;
    }

    const processedElements = new WeakSet<HTMLElement>();

    function handleMutations(mutations: MutationRecord[]): void {
      const addedElements = extractAddedElements(mutations).filter(
        element => !processedElements.has(element),
      );

      if (addedElements.length === 0) {
        return;
      }

      for (const element of addedElements) {
        processedElements.add(element);
      }

      const { hasPrepended, hasAppended, firstPrepended, firstExisting } = classifyAddedElements(
        element.nativeElement,
        addedElements,
      );

      if (hasPrepended && firstPrepended && firstExisting) {
        compensatePrependedScroll(
          element.nativeElement,
          firstPrepended,
          firstExisting,
          lastScrollTop,
        );
      }

      if (hasAppended) {
        scrollToBottomIfNeeded('instant');
      }

      onScroll();
    }

    // Host bindings
    dataBinding(element, 'data-at-bottom', isAtBottom);

    // Listener
    listener(element, 'scroll', onScroll);

    // no scroll event fires when the threshold itself changes, so recompute against the new value
    explicitEffect([threshold], () => {
      if (hasRendered) {
        onScroll();
      }
    });

    afterNextRender({
      write: () => {
        if (initialScrollPosition() === 'end') {
          element.nativeElement.scrollTo({
            top: element.nativeElement.scrollHeight,
            behavior: 'instant',
          });
        }

        onScroll();
        hasRendered = true;
      },
    });

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

    if (typeof MutationObserver !== 'undefined') {
      fromMutationObserver(element.nativeElement, { childList: true })
        .pipe(
          filter(mutations => mutations.some(mutation => mutation.addedNodes.length > 0)),
          safeTakeUntilDestroyed(),
        )
        .subscribe(handleMutations);
    }

    const state = {
      isAtBottom: isAtBottom.asReadonly(),
      scrollToBottom,
      scrollToBottomIfNeeded,
    } satisfies NgpThreadViewportState;

    thread().setViewport(state);
    onDestroy(() => thread().removeViewport(state));

    return state;
  },
);
