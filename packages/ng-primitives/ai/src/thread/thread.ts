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

  constructor() {
    // update the scroll position when the user scrolls
    // but debounce it to avoid conflicts with the resize
    fromEvent(this.elementRef.nativeElement, 'scroll')
      .pipe(debounceTime(1), safeTakeUntilDestroyed())
      .subscribe(() => {
        // If user manually scrolls during a programmatic smooth scroll, cancel it
        if (!this.isScrollingProgrammatically && this.scrollAnimationId !== null) {
          cancelAnimationFrame(this.scrollAnimationId);
          this.scrollAnimationId = null;
          this.isScrollingProgrammatically = false;
        }

        this.updateIsAtBottom();
      });

    // if the size of the container changes, update the scroll position
    fromResizeEvent(this.elementRef.nativeElement)
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => {
        // if we were at the bottom, but the size changed, stay at the bottom
        if (this.isAtBottom) {
          this.scrollToBottom();
        }
      });

    afterNextRender(() => {
      // if we should start at the bottom, scroll to the bottom
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
    // Cancel any ongoing smooth scroll animation
    if (this.scrollAnimationId !== null) {
      cancelAnimationFrame(this.scrollAnimationId);
      this.scrollAnimationId = null;
    }

    const element = this.elementRef.nativeElement;
    const targetScrollTop = element.scrollHeight - element.clientHeight;

    if (this.initializing) {
      // Instant scroll during initialization
      element.scrollTop = targetScrollTop;
      return;
    }

    // Perform custom smooth scroll
    const startScrollTop = element.scrollTop;
    const distance = targetScrollTop - startScrollTop;

    if (Math.abs(distance) < 1) {
      // Already at target position
      return;
    }

    const duration = 300; // Smooth scroll duration in milliseconds
    const startTime = performance.now();

    this.isScrollingProgrammatically = true;

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smooth animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      element.scrollTop = startScrollTop + distance * easeProgress;

      if (progress < 1 && this.isScrollingProgrammatically) {
        this.scrollAnimationId = requestAnimationFrame(animateScroll);
      } else {
        // Animation complete or cancelled
        this.isScrollingProgrammatically = false;
        this.scrollAnimationId = null;
      }
    };

    this.scrollAnimationId = requestAnimationFrame(animateScroll);
  }

  /** @internal Clean up any ongoing animations */
  private cancelScrollAnimation(): void {
    if (this.scrollAnimationId !== null) {
      cancelAnimationFrame(this.scrollAnimationId);
      this.scrollAnimationId = null;
      this.isScrollingProgrammatically = false;
    }
  }

  private updateIsAtBottom(): void {
    const scrollPosition =
      this.elementRef.nativeElement.scrollTop + this.elementRef.nativeElement.clientHeight;
    const scrollHeight = this.elementRef.nativeElement.scrollHeight;
    this.isAtBottom = scrollHeight - scrollPosition <= this.threshold();
  }
}
