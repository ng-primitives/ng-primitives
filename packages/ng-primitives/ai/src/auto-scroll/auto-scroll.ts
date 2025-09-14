import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { NgpAutoScrollContent } from './auto-scroll-content';

@Directive({
  selector: '[ngpAutoScroll]',
  exportAs: 'ngpAutoScroll',
})
export class NgpAutoScroll {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** The distance that is considered the bottom */
  readonly threshold = input<number, NumberInput>(70, { transform: numberAttribute });

  /** Whether to start at the bottom */
  readonly startAtBottom = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

  // Internal signals for state
  private readonly isAtBottom = signal<boolean>(this.startAtBottom());
  private readonly isNearBottom = signal<boolean>(false);
  private readonly escapedFromLock = signal<boolean>(false);
  private lastScrollTop = 0;
  private resizeObserver!: ResizeObserver;

  private readonly contentElement = contentChild(NgpAutoScrollContent, { read: ElementRef });
  private previousContentHeight?: number;

  constructor() {
    this.setupScrollListener();
    this.updateScrollState();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.scrollElement.removeEventListener('scroll', this.onScroll);
    this.scrollElement.removeEventListener('wheel', this.onWheel);
    this.resizeObserver.disconnect();
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      const heightDifference = height - (this.previousContentHeight ?? height);

      // Handle overscroll - adjust if we've scrolled past the target
      if (this.scrollTop > this.targetScrollTop) {
        this.scrollElement.scrollTop = this.targetScrollTop;
      }

      // Update near bottom state after resize
      this.isNearBottom.set(this.scrollDifference <= this.threshold());

      if (heightDifference >= 0) {
        // Content grew - auto-scroll to bottom if we're already at bottom
        if (this.isAtBottom() && !this.escapedFromLock()) {
          this.scrollToBottom();
        }
      } else {
        // Content shrunk - check if we're now near bottom and should re-engage
        if (this.scrollDifference <= this.threshold()) {
          this.escapedFromLock.set(false);
          this.isAtBottom.set(true);
        }
      }

      this.previousContentHeight = height;
    });

    this.resizeObserver.observe(
      this.contentElement()?.nativeElement ?? this.elementRef.nativeElement,
    );
  }

  private setupScrollListener(): void {
    this.scrollElement.addEventListener('scroll', this.onScroll, { passive: true });
    this.scrollElement.addEventListener('wheel', this.onWheel, { passive: true });
  }

  private onScroll = (): void => {
    // Use setTimeout to handle timing issues between resize and scroll events
    setTimeout(() => this.updateScrollState(), 1);
  };

  private onWheel = (event: WheelEvent): void => {
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
  };

  private updateScrollState(): void {
    const currentScrollTop = this.scrollTop;
    const isScrollingUp = currentScrollTop < this.lastScrollTop;
    const isScrollingDown = currentScrollTop > this.lastScrollTop;
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

    this.lastScrollTop = currentScrollTop;
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

  scrollToBottom(): void {
    this.scrollElement.scrollTop = this.targetScrollTop;
    this.isAtBottom.set(true);
    this.escapedFromLock.set(false);
  }

  // Public method to stop auto-scrolling
  stopScroll(): void {
    this.escapedFromLock.set(true);
    this.isAtBottom.set(false);
  }
}
