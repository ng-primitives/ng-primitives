import { FocusMonitor, FocusOrigin, InteractivityChecker } from '@angular/cdk/a11y';
import { afterNextRender, inject, Injector, NgZone, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

class FocusTrap {
  /**
   * Whether the focus trap is active.
   */
  active: boolean = false;

  /**
   * Activates the focus trap.
   */
  activate(): void {
    this.active = true;
  }

  /**
   * Deactivates the focus trap.
   */
  deactivate(): void {
    this.active = false;
  }
}

class FocusTrapStack {
  /**
   * The stack of focus traps.
   */
  private readonly stack: FocusTrap[] = [];

  /**
   * Adds a focus trap to the stack.
   */
  add(focusTrap: FocusTrap): void {
    // deactivate the previous focus trap
    this.stack.forEach(t => t.deactivate());

    // add the new focus trap and activate it
    this.stack.push(focusTrap);
    focusTrap.activate();
  }

  /**
   * Removes a focus trap from the stack.
   */
  remove(focusTrap: FocusTrap): void {
    // remove the focus trap
    const index = this.stack.indexOf(focusTrap);

    if (index >= 0) {
      this.stack.splice(index, 1);
    }

    // activate the previous focus trap
    const previous = this.stack[this.stack.length - 1];

    if (previous) {
      previous.activate();
    }
  }
}

// create a global stack of focus traps
const focusTrapStack = new FocusTrapStack();

/**
 * The state for the FocusTrap primitive.
 */
export interface NgpFocusTrapState {
  // No public API
}

/**
 * The props for the FocusTrap primitive.
 */
export interface NgpFocusTrapProps {
  /**
   * Whether the focus trap is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The focus origin to use when programmatically focusing elements.
   * If not provided, falls back to the FocusMonitor's last known origin.
   */
  readonly focusOrigin?: Signal<FocusOrigin>;
}

export const [NgpFocusTrapStateToken, ngpFocusTrap, injectFocusTrapState, provideFocusTrapState] =
  createPrimitive(
    'NgpFocusTrap',
    ({ disabled = signal(false), focusOrigin }: NgpFocusTrapProps) => {
    const element = injectElementRef();
    const overlay = inject(NgpOverlay, { optional: true });
    const injector = inject(Injector);
    const focusMonitor = inject(FocusMonitor);
    const interactivityChecker = inject(InteractivityChecker);
    const ngZone = inject(NgZone);

    // Create a new focus trap
    const focusTrap = new FocusTrap();

    // Store the mutation observer
    let mutationObserver: MutationObserver | null = null;

    // Store the last focused element
    let lastFocusedElement: HTMLElement | null = null;

    // Host bindings
    attrBinding(element, 'tabindex', '-1');
    dataBinding(element, 'data-focus-trap', () => (disabled() ? null : ''));

    // Setup the focus trap
    function setupFocusTrap(): void {
      focusTrapStack.add(focusTrap);

      mutationObserver = new MutationObserver(handleMutations);

      // Setup event listeners
      ngZone.runOutsideAngular(() => {
        mutationObserver!.observe(element.nativeElement, {
          childList: true,
          subtree: true,
        });
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);
      });

      const previouslyFocusedElement = document.activeElement as HTMLElement | null;
      const hasFocusedCandidate = element.nativeElement.contains(previouslyFocusedElement);

      // Only perform initial focusing if the focus trap is not disabled
      if (!hasFocusedCandidate && !disabled?.()) {
        // we do this to ensure the content is rendered before we try to find the first focusable element
        // and focus it
        afterNextRender(
          {
            write: () => {
              focusFirst();

              // if the focus didn't change, focus the container
              if (document.activeElement === previouslyFocusedElement) {
                focus(element.nativeElement);
              }
            },
          },
          { injector },
        );
      }
    }

    function teardownFocusTrap(): void {
      focusTrapStack.remove(focusTrap);
      mutationObserver?.disconnect();
      mutationObserver = null;
      focusTrap.deactivate();

      // Remove event listeners
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    }

    function handleFocusIn(event: FocusEvent): void {
      if (!focusTrap.active || disabled?.()) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (element.nativeElement.contains(target)) {
        lastFocusedElement = target;
      } else {
        focus(lastFocusedElement);
      }
    }

    /**
     * Handles the `focusout` event.
     */
    function handleFocusOut(event: FocusEvent) {
      if (!focusTrap.active || disabled?.() || event.relatedTarget === null) {
        return;
      }

      const relatedTarget = event.relatedTarget as HTMLElement;

      if (!element.nativeElement.contains(relatedTarget)) {
        focus(lastFocusedElement);
      }
    }

    /**
     * If the focused element gets removed from the DOM, browsers move focus back to the document.body.
     * We move focus to the container to keep focus trapped correctly.
     */
    function handleMutations(mutations: MutationRecord[]): void {
      const focusedElement = document.activeElement as HTMLElement | null;

      if (focusedElement !== document.body) {
        return;
      }

      for (const mutation of mutations) {
        if (mutation.removedNodes.length > 0) {
          focus(element.nativeElement);
        }
      }
    }

    /**
     * Handles the `keydown` event.
     */
    function handleKeyDown(event: KeyboardEvent): void {
      if (!focusTrap.active || disabled?.()) {
        return;
      }

      const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement as HTMLElement | null;

      if (isTabKey && focusedElement) {
        const container = event.currentTarget as HTMLElement;
        const [first, last] = getTabbableEdges(container);
        const hasTabbableElementsInside = first && last;

        // we can only wrap focus if we have tabbable edges
        if (!hasTabbableElementsInside) {
          if (focusedElement === container) {
            event.preventDefault();
          }
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            focus(first);
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            focus(last);
          }
        }
      }
    }

    /**
     * Returns the first and last tabbable elements inside a container.
     */
    function getTabbableEdges(container: HTMLElement) {
      const candidates = getTabbableCandidates(container);
      const first = findVisible(candidates);
      const last = findVisible(candidates.reverse());
      return [first, last] as const;
    }

    /**
     * Returns a list of potential focusable elements inside a container.
     */
    function getTabbableCandidates(container: HTMLElement) {
      const nodes: HTMLElement[] = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node: HTMLElement) =>
          interactivityChecker.isFocusable(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP,
      });
      while (walker.nextNode()) {
        nodes.push(walker.currentNode as HTMLElement);
      }
      return nodes;
    }

    /**
     * Returns the first visible element in a list..
     */
    function findVisible(elements: HTMLElement[]) {
      return elements.find(element => interactivityChecker.isVisible(element)) ?? null;
    }

    function focus(element: HTMLElement | null): void {
      if (!element) {
        return;
      }
      // Use the provided focus origin if available, otherwise fall back to FocusMonitor's last origin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const origin = focusOrigin?.() ?? (focusMonitor as any)._lastFocusOrigin ?? 'program';
      focusMonitor.focusVia(element, origin, {
        preventScroll: true,
      });
    }

    function focusFirst(): void {
      const previouslyFocusedElement = document.activeElement;

      for (const candidate of getTabbableCandidates(element.nativeElement)) {
        focus(candidate);

        if (document.activeElement !== previouslyFocusedElement) {
          return;
        }
      }
    }

    // Setup the focus trap
    setupFocusTrap();

    // Teardown the focus trap on destroy
    onDestroy(teardownFocusTrap);

    // Listen to keydown events
    listener(element, 'keydown', handleKeyDown);

    // if this is used within an overlay we must disable the focus trap as soon as the overlay is closing
    overlay?.closing.pipe(safeTakeUntilDestroyed()).subscribe(() => focusTrap.deactivate());

    return {} satisfies NgpFocusTrapState;
  },
);
