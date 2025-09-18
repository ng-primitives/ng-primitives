import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectThreadState } from '../thread/thread-state';
import { provideThreadViewportState, threadViewportState } from './thread-viewport-state';

@Directive({
  selector: '[ngpThreadViewport]',
  exportAs: 'ngpThreadViewport',
  providers: [provideThreadViewportState()],
})
export class NgpThreadViewport {
  private readonly thread = injectThreadState();
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
    alias: 'ngpThreadViewportThreshold',
    transform: numberAttribute,
  });

  /**
   * Whether the thread should automatically scroll to the bottom when new content is added.
   */
  readonly autoScroll = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadViewportAutoScroll',
    transform: booleanAttribute,
  });

  /** Store the last known scroll position */
  private lastScrollTop = 0;

  /** Determine if we are at the bottom of the scrollable container (within the threshold) */
  protected isAtBottom = false;

  /** The state of the thread viewport. */
  protected readonly state = threadViewportState<NgpThreadViewport>(this);

  constructor() {
    // listen for scroll requests from the thread
    this.thread()
      .scrollRequest.pipe(safeTakeUntilDestroyed())
      .subscribe(behavior => this.scrollToBottom(behavior));

    fromResizeEvent(this.elementRef.nativeElement)
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => {
        if (this.isAtBottom) {
          this.scrollToBottom('instant');
        }
        this.onScroll();
      });
  }

  /**
   * Scroll the container to the bottom.
   * @internal
   */
  scrollToBottom(behavior: ScrollBehavior): void {
    if (!this.state.autoScroll()) {
      return;
    }

    this.elementRef.nativeElement.scrollTo({
      top: this.elementRef.nativeElement.scrollHeight,
      behavior,
    });
  }

  @HostListener('scroll')
  protected onScroll(): void {
    const element = this.elementRef.nativeElement;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight;

    if (isAtBottom || this.lastScrollTop >= element.scrollTop) {
      this.isAtBottom = isAtBottom;
    }

    this.lastScrollTop = element.scrollTop;
  }
}
