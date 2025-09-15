import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
} from '@angular/core';
import { fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { debounceTime, fromEvent } from 'rxjs';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
})
export class NgpThread implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

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

  /** Determine if we are at the bottom of the scrollable container (within the threshold) */
  protected isAtBottom = false;

  /** Determine if we are still initializing */
  private initializing = true;

  /** Track if we're currently performing a programmatic scroll */
  private isScrollingProgrammatically = false;

  /** Store the animation frame ID for canceling smooth scrolls */
  private scrollAnimationId: number | null = null;

  /** Track the last time the user manually scrolled */
  private lastManualScrollTime = 0;

  constructor() {
    // Update scroll position when user scrolls, but debounce to avoid conflicts with the resize observer
    fromEvent(this.elementRef.nativeElement, 'scroll')
      .pipe(debounceTime(1), safeTakeUntilDestroyed())
      .subscribe(() => {
        // Cancel any ongoing programmatic scroll if user scrolls manually
        if (!this.isScrollingProgrammatically) {
          this.lastManualScrollTime = Date.now();
          this.cancelScrollAnimation();
        }
        this.updateIsAtBottom();
      });

    // Maintain bottom position when container resizes
    fromResizeEvent(this.elementRef.nativeElement)
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => {
        if (this.isAtBottom) {
          this.scrollToBottom();
        }
      });

    // Initialize scroll position after render
    afterNextRender(() => {
      if (this.startAtBottom()) {
        this.scrollToBottom();
      }
      this.initializing = false;
    });
  }

  ngOnDestroy(): void {
    this.cancelScrollAnimation();
  }

  /** @internal Scroll to the bottom of the thread */
  scrollToBottom(): void {
    this.cancelScrollAnimation();

    // Don't scroll if user has manually scrolled within the last 500ms
    if (!this.initializing && Date.now() - this.lastManualScrollTime < 500) {
      return;
    }

    const element = this.elementRef.nativeElement;
    const targetScrollTop = element.scrollHeight - element.clientHeight;

    if (this.initializing) {
      element.scrollTop = targetScrollTop;
      return;
    }

    this.startSmoothScroll(element, targetScrollTop);
  }

  private startSmoothScroll(element: HTMLElement, targetScrollTop: number): void {
    const startScrollTop = element.scrollTop;
    const distance = targetScrollTop - startScrollTop;

    if (Math.abs(distance) < 1) return; // Already at target

    const duration = 300;
    const startTime = performance.now();
    this.isScrollingProgrammatically = true;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      element.scrollTop = startScrollTop + distance * easeProgress;

      if (progress < 1 && this.isScrollingProgrammatically) {
        this.scrollAnimationId = requestAnimationFrame(animate);
      } else {
        this.isScrollingProgrammatically = false;
        this.scrollAnimationId = null;
      }
    };

    this.scrollAnimationId = requestAnimationFrame(animate);
  }

  private cancelScrollAnimation(): void {
    if (this.scrollAnimationId !== null) {
      cancelAnimationFrame(this.scrollAnimationId);
      this.scrollAnimationId = null;
      this.isScrollingProgrammatically = false;
    }
  }

  private updateIsAtBottom(): void {
    const { scrollTop, clientHeight, scrollHeight } = this.elementRef.nativeElement;
    const scrollPosition = scrollTop + clientHeight;
    this.isAtBottom = scrollHeight - scrollPosition <= this.threshold();
  }
}
