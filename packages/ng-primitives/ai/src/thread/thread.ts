import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { explicitEffect, fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { combineLatest } from 'rxjs';
import { NgpThreadMessage } from '../thread-message/thread-message';
import { NgpThreadViewport } from '../thread-viewport/thread-viewport';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
})
export class NgpThread {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /** The distance that is considered the bottom */
  readonly threshold = input<number, NumberInput>(70, {
    alias: 'ngpThreadThreshold',
    transform: numberAttribute,
  });

  /** Whether to start at the bottom */
  readonly startAtBottom = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadStartAtBottom',
    transform: booleanAttribute,
  });

  // Internal signals for state
  private readonly isAtBottom = signal<boolean>(this.startAtBottom());
  private readonly isNearBottom = signal<boolean>(false);
  private readonly escapedFromLock = signal<boolean>(false);
  private scrollPosition = 0;
  private height?: number;

  private readonly viewport = contentChild(NgpThreadViewport, { read: ElementRef });
  private readonly messages = contentChildren(NgpThreadMessage, { descendants: true });

  constructor() {
    this.updateScrollState();

    afterNextRender(() => this.setupResizeObserver());

    // any time a new message is added, scroll to the bottom
    explicitEffect([this.messages], ([messages]) => {
      if (messages.length === 0) {
        return;
      }

      this.scrollToBottom('smooth');
    });
  }

  private setupResizeObserver(): void {
    const viewport = this.viewport();

    if (!viewport) {
      return;
    }

    combineLatest([
      fromResizeEvent(this.scrollElement, { injector: this.injector }),
      fromResizeEvent(viewport.nativeElement, { injector: this.injector }),
    ])
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const height = this.viewport()?.nativeElement.offsetHeight ?? 0;
        const heightDifference = height - (this.height ?? height);

        // Handle overscroll - adjust if we've scrolled past the target
        if (this.scrollTop > this.targetScrollTop) {
          this.scrollElement.scrollTop = this.targetScrollTop;
        }

        // Update near bottom state after resize
        this.isNearBottom.set(this.scrollDifference <= this.threshold());

        if (heightDifference >= 0) {
          // Content grew - auto-scroll to bottom if we're already at bottom
          if (this.isAtBottom() && !this.escapedFromLock()) {
            this.scrollToBottom('smooth');
          }
        } else {
          // Content shrunk - check if we're now near bottom and should re-engage
          if (this.scrollDifference <= this.threshold()) {
            // Scroll to bottom if we were at bottom before
            if (this.isAtBottom()) {
              this.scrollToBottom('smooth');
            }

            this.escapedFromLock.set(false);
            this.isAtBottom.set(true);
          }
        }

        this.height = height;
      });
  }

  @HostListener('scroll')
  protected onScroll(): void {
    // Use setTimeout to handle timing issues between resize and scroll events
    setTimeout(() => this.updateScrollState(), 1);
  }

  @HostListener('wheel', ['$event'])
  protected onWheel(event: WheelEvent): void {
    let element = event.target as HTMLElement;

    // Find the scrollable element in the hierarchy
    while (!['scroll', 'auto'].includes(getComputedStyle(element).overflow)) {
      if (!element.parentElement) {
        return;
      }
      element = element.parentElement;
    }

    // If scrolling up with wheel on our scroll element and content is scrollable
    if (
      element === this.scrollElement &&
      event.deltaY < 0 &&
      this.scrollHeight > this.clientHeight
    ) {
      this.escapedFromLock.set(true);
      this.isAtBottom.set(false);
    }
  }

  private updateScrollState(): void {
    const currentScrollTop = this.scrollTop;
    const isScrollingUp = currentScrollTop < this.scrollPosition;
    const isScrollingDown = currentScrollTop > this.scrollPosition;
    const isNearBottom = this.scrollDifference <= this.threshold();

    // Update near bottom state
    this.isNearBottom.set(isNearBottom);

    // Handle user scrolling up - escape from lock
    if (isScrollingUp) {
      this.escapedFromLock.set(true);
      this.isAtBottom.set(false);
    }

    // Handle user scrolling down - clear escape if scrolling down
    if (isScrollingDown) {
      this.escapedFromLock.set(false);
    }

    // Re-engage auto-scroll if we're near bottom and not escaped
    if (!this.escapedFromLock() && isNearBottom) {
      this.isAtBottom.set(true);
    }

    this.scrollPosition = currentScrollTop;
  }

  // Getter for the scroll element
  private get scrollElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  // Helper methods for scroll calculations
  private get scrollTop(): number {
    return this.scrollElement.scrollTop;
  }

  private get scrollHeight(): number {
    return this.scrollElement.scrollHeight;
  }

  private get clientHeight(): number {
    return this.scrollElement.clientHeight;
  }

  private get targetScrollTop(): number {
    return Math.max(0, this.scrollHeight - this.clientHeight);
  }

  private get scrollDifference(): number {
    return this.targetScrollTop - this.scrollTop;
  }

  /**
   * Scrolls the content to the bottom.
   */
  private scrollToBottom(behavior: ScrollBehavior): void {
    this.scrollElement.scrollTo({ top: this.targetScrollTop, behavior });
    this.isAtBottom.set(true);
    this.escapedFromLock.set(false);
  }
}
