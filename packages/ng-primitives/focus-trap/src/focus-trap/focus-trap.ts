import { FocusMonitor, InteractivityChecker } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgpOverlay } from 'ng-primitives/portal';
import { focusTrapState, provideFocusTrapState } from './focus-trap-state';

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

/**
 * The `NgpFocusTrap` directive traps focus within the host element.
 */
@Directive({
  selector: '[ngpFocusTrap]',
  exportAs: 'ngpFocusTrap',
  providers: [provideFocusTrapState()],
  host: {
    '[attr.tabindex]': '-1',
    '[attr.data-focus-trap]': '!disabled() ? "" : null',
  },
})
export class NgpFocusTrap implements OnInit, OnDestroy {
  /**
   * Access any parent overlay.
   */
  private readonly overlay = inject(NgpOverlay, { optional: true });

  /**
   * Create a new focus trap.
   */
  private readonly focusTrap = new FocusTrap();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the focus monitor.
   */
  private readonly focusMonitor = inject(FocusMonitor);

  /**
   * Access the interactivity checker.
   */
  private readonly interactivityChecker = inject(InteractivityChecker);

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

  /**
   * Whether the focus trap is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusTrapDisabled',
    transform: booleanAttribute,
  });

  /**
   * The focus trap state.
   */
  protected readonly state = focusTrapState<NgpFocusTrap>(this);

  constructor() {
    // if this is used within an overlay we must disable the focus trap as soon as the overlay is closing
    this.overlay?.closing.pipe(takeUntilDestroyed()).subscribe(() => this.focusTrap.deactivate());
  }

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
      // we do this to ensure the content is rendered before we try to find the first focusable element
      // and focus it
      afterNextRender(
        {
          write: () => {
            this.focusFirst();

            // if the focus didn't change, focus the container
            if (document.activeElement === previouslyFocusedElement) {
              this.focus(this.elementRef.nativeElement);
            }
          },
        },
        { injector: this.injector },
      );
    }
  }

  ngOnDestroy(): void {
    focusTrapStack.remove(this.focusTrap);
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.focusTrap.deactivate();
  }

  private handleFocusIn(event: FocusEvent): void {
    if (!this.focusTrap.active || this.state.disabled()) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (this.elementRef.nativeElement.contains(target)) {
      this.lastFocusedElement = target;
    } else {
      this.focus(this.lastFocusedElement);
    }
  }

  /**
   * Handles the `focusout` event.
   */
  private handleFocusOut(event: FocusEvent) {
    if (!this.focusTrap.active || this.state.disabled() || event.relatedTarget === null) {
      return;
    }

    const relatedTarget = event.relatedTarget as HTMLElement;

    if (!this.elementRef.nativeElement.contains(relatedTarget)) {
      this.focus(this.lastFocusedElement);
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
    if (!this.focusTrap.active || this.state.disabled()) {
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
        if (focusedElement === container) {
          event.preventDefault();
        }
      } else {
        if (!event.shiftKey && focusedElement === last) {
          event.preventDefault();
          this.focus(first);
        } else if (event.shiftKey && focusedElement === first) {
          event.preventDefault();
          this.focus(last);
        }
      }
    }
  }

  /**
   * Returns the first and last tabbable elements inside a container.
   */
  private getTabbableEdges(container: HTMLElement) {
    const candidates = this.getTabbableCandidates(container);
    const first = this.findVisible(candidates);
    const last = this.findVisible(candidates.reverse());
    return [first, last] as const;
  }

  /**
   * Returns a list of potential focusable elements inside a container.
   */
  private getTabbableCandidates(container: HTMLElement) {
    const nodes: HTMLElement[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node: HTMLElement) =>
        this.interactivityChecker.isFocusable(node)
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
  private findVisible(elements: HTMLElement[]) {
    return elements.find(element => this.interactivityChecker.isVisible(element)) ?? null;
  }

  private focus(element: HTMLElement | null): void {
    if (!element) {
      return;
    }
    // Its not great that we are relying on an internal API here, but we need to in order to
    // try and best determine the focus origin when it is programmatically closed by the user.
    this.focusMonitor.focusVia(element, (this.focusMonitor as any)._lastFocusOrigin, {
      preventScroll: true,
    });
  }

  private focusFirst(): void {
    const previouslyFocusedElement = document.activeElement;

    for (const candidate of this.getTabbableCandidates(this.elementRef.nativeElement)) {
      this.focus(candidate);

      if (document.activeElement !== previouslyFocusedElement) {
        return;
      }
    }
  }
}
