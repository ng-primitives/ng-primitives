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
  signal,
} from '@angular/core';
import { fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import type { NgpThreadMessage } from '../thread-message/thread-message';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
})
export class NgpThread implements OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /**
   * The distance in pixels from the bottom of the scrollable container that is considered "at the bottom".
   * When the user scrolls within this threshold, the thread is treated as being at the bottom.
   * This value is used to determine whether automatic scrolling to the bottom should occur,
   * for example when new content is added or the container is resized.
   *
   * @default 70
   */
  readonly threshold = input<number, NumberInput>(70, {
    alias: 'ngpThreadThreshold',
    transform: numberAttribute,
  });

  /* Whether to initialize the scroll position at the bottom of the container when the thread is first rendered.
   * If set to `true`, the thread will automatically scroll to the bottom on initialization to show the most recent message.
   * If set to `false`, the initial scroll position will be not be modified.
   * This is useful for chat or feed interfaces where you want to show the latest content by default.
   *
   * @default true
   */
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

  /** The message element associated with this thread */
  private readonly messages = signal<NgpThreadMessage[]>([]);

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

  /**
   * Check if we should scroll to bottom and do so if we are currently at the bottom.
   * This should be called when content is dynamically added or updated (like during streaming).
   */
  checkAndScrollToBottom(message: NgpThreadMessage): void {
    this.updateIsAtBottom();
    // if this is not the last message, do nothing
    if (this.isAtBottom && message === this.messages().at(-1) && !this.initializing) {
      this.scrollToBottom();
    }
  }

  /** @internal Scroll to the bottom of the thread */
  scrollToBottom(): void {
    this.cancelScrollAnimation();

    // if we are initializing and startAtBottom is false, do nothing
    if (this.initializing && !this.startAtBottom()) {
      return;
    }

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

  /** @internal */
  registerMessage(message: NgpThreadMessage): void {
    this.messages.update(msgs => [...msgs, message]);
  }

  /** @internal */
  unregisterMessage(message: NgpThreadMessage): void {
    this.messages.update(msgs => msgs.filter(m => m !== message));
  }
}
