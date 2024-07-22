/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgpFocusTrapToken } from './focus-trap.token';

/**
 * This implementation is based on the Radix UI FocusScope:
 * https://github.com/radix-ui/primitives/blob/main/packages/react/focus-scope/src/FocusScope.tsx#L306
 */

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

@Directive({
  standalone: true,
  selector: '[ngpFocusTrap]',
  exportAs: 'ngpFocusTrap',
  providers: [{ provide: NgpFocusTrapToken, useExisting: NgpFocusTrap }],
  host: {
    '[attr.tabindex]': '-1',
  },
})
export class NgpFocusTrap implements OnInit, OnDestroy {
  /**
   * Create a new focus trap.
   */
  private readonly focusTrap = new FocusTrap();

  /**
   * Get the focus trap container element.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access NgZone to run the focus trap events outside of Angular's zone.
   */
  private readonly ngZone = inject(NgZone);

  /**
   * Store the mutation observer.
   */
  private mutationObserver: MutationObserver | null = null;

  /**
   * Store the last focused element.
   */
  private lastFocusedElement: HTMLElement | null = null;

  ngOnInit(): void {
    focusTrapStack.add(this.focusTrap);

    this.mutationObserver = new MutationObserver(this.handleMutations.bind(this));

    // setup event listeners
    this.ngZone.runOutsideAngular(() => {
      this.mutationObserver!.observe(this.elementRef.nativeElement, {
        childList: true,
        subtree: true,
      });
      document.addEventListener('focusin', this.handleFocusIn.bind(this));
      document.addEventListener('focusout', this.handleFocusOut.bind(this));
    });

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const hasFocusedCandidate = this.elementRef.nativeElement.contains(previouslyFocusedElement);

    if (!hasFocusedCandidate) {
      this.focusFirst(this.removeLinks(this.getTabbableCandidates(this.elementRef.nativeElement)), {
        select: true,
      });
      if (document.activeElement === previouslyFocusedElement) {
        this.focus(this.elementRef.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    focusTrapStack.remove(this.focusTrap);
    this.mutationObserver?.disconnect();
  }

  private handleFocusIn(event: FocusEvent): void {
    if (!this.focusTrap.active) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (this.elementRef.nativeElement.contains(target)) {
      this.lastFocusedElement = target;
    } else {
      this.focus(this.lastFocusedElement, { select: true });
    }
  }

  /**
   * Handles the `focusout` event.
   */
  private handleFocusOut(event: FocusEvent) {
    if (!this.focusTrap.active || event.relatedTarget === null) {
      return;
    }

    const relatedTarget = event.relatedTarget as HTMLElement;

    if (!this.elementRef.nativeElement.contains(relatedTarget)) {
      this.focus(this.lastFocusedElement, { select: true });
    }
  }

  /**
   * If the focused element gets removed from the DOM, browsers move focus back to the document.body.
   * We move focus to the container to keep focus trapped correctly.
   */
  private handleMutations(mutations: MutationRecord[]): void {
    const focusedElement = document.activeElement as HTMLElement | null;

    if (focusedElement !== document.body) {
      return;
    }

    for (const mutation of mutations) {
      if (mutation.removedNodes.length > 0) {
        this.focus(this.elementRef.nativeElement);
      }
    }
  }

  /**
   * Handles the `keydown` event.
   */
  @HostListener('keydown', ['$event'])
  protected handleKeyDown(event: KeyboardEvent): void {
    if (!this.focusTrap.active) {
      return;
    }

    const isTabKey = event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey;
    const focusedElement = document.activeElement as HTMLElement | null;

    if (isTabKey && focusedElement) {
      const container = event.currentTarget as HTMLElement;
      const [first, last] = this.getTabbableEdges(container);
      const hasTabbableElementsInside = first && last;

      // we can only wrap focus if we have tabbable edges
      if (!hasTabbableElementsInside) {
        if (focusedElement === container) event.preventDefault();
      } else {
        if (!event.shiftKey && focusedElement === last) {
          event.preventDefault();
          this.focus(first, { select: true });
        } else if (event.shiftKey && focusedElement === first) {
          event.preventDefault();
          this.focus(last, { select: true });
        }
      }
    }
  }

  /**
   * Returns the first and last tabbable elements inside a container.
   */
  private getTabbableEdges(container: HTMLElement) {
    const candidates = this.getTabbableCandidates(container);
    const first = this.findVisible(candidates, container);
    const last = this.findVisible(candidates.reverse(), container);
    return [first, last] as const;
  }

  /**
   * Returns a list of potential tabbable candidates.
   *
   * NOTE: This is only a close approximation. For example it doesn't take into account cases like when
   * elements are not visible. This cannot be worked out easily by just reading a property, but rather
   * necessitate runtime knowledge (computed styles, etc). We deal with these cases separately.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
   * Credit: https://github.com/discord/focus-layers/blob/master/src/util/wrapFocus.tsx#L1
   */
  private getTabbableCandidates(container: HTMLElement) {
    const nodes: HTMLElement[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node: any) => {
        const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
        if (node.disabled || node.hidden || isHiddenInput) {
          return NodeFilter.FILTER_SKIP;
        }
        // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
        // runtime's understanding of tabbability, so this automatically accounts
        // for any kind of element that could be tabbed to.
        return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
    // we do not take into account the order of nodes with positive `tabIndex` as it
    // hinders accessibility to have tab order different from visual order.
    return nodes;
  }

  /**
   * Returns the first visible element in a list.
   * NOTE: Only checks visibility up to the `container`.
   */
  private findVisible(elements: HTMLElement[], container: HTMLElement) {
    for (const element of elements) {
      // we stop checking if it's hidden at the `container` level (excluding)
      if (!this.isHidden(element, { upTo: container })) return element;
    }

    return null;
  }

  private isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }) {
    if (getComputedStyle(node).visibility === 'hidden') return true;
    while (node) {
      // we stop at `upTo` (excluding it)
      if (upTo !== undefined && node === upTo) return false;
      if (getComputedStyle(node).display === 'none') return true;
      node = node.parentElement as HTMLElement;
    }
    return false;
  }

  private focus(element?: HTMLElement | null, { select = false } = {}) {
    // only focus if that element is focusable
    if (element && element.focus) {
      const previouslyFocusedElement = document.activeElement;
      // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
      element.focus({ preventScroll: true });
      // only select if its not the same element, it supports selection and we need to select
      if (element !== previouslyFocusedElement && this.isSelectableInput(element) && select)
        element.select();
    }
  }

  private isSelectableInput(element: HTMLElement): element is HTMLElement & { select: () => void } {
    return element instanceof HTMLInputElement && 'select' in element;
  }

  /**
   * Attempts focusing the first element in a list of candidates.
   * Stops when focus has actually moved.
   */
  private focusFirst(candidates: HTMLElement[], { select = false } = {}) {
    const previouslyFocusedElement = document.activeElement;
    for (const candidate of candidates) {
      this.focus(candidate, { select });
      if (document.activeElement !== previouslyFocusedElement) return;
    }
  }

  private removeLinks(items: HTMLElement[]): HTMLElement[] {
    return items.filter(item => item.tagName !== 'A');
  }
}
