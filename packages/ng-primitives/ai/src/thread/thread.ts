import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  afterNextRender,
  booleanAttribute,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
} from '@angular/core';
import { debounceTime, fromEvent } from 'rxjs';
import { fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

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

  /** Determine if we are at the bottom of the scrollable container (within the threshold) */
  protected isAtBottom = false;

  /** Determine if we are still initializing */
  private initializing = true;

  constructor() {
    // update the scroll position when the user scrolls
    // but debounce it to avoid conflicts with the resize
    fromEvent(this.elementRef.nativeElement, 'scroll')
      .pipe(debounceTime(1), safeTakeUntilDestroyed())
      .subscribe(() => this.updateIsAtBottom());

    // if the size of the container changes, update the scroll position
    fromResizeEvent(this.elementRef.nativeElement)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // if we were at the bottom, but the size changed, stay at the bottom
        if (this.isAtBottom) {
          this.scrollToBottom('instant');
        }
      });

    afterNextRender(() => {
      // if we should start at the bottom, scroll to the bottom
      if (this.startAtBottom()) {
        this.scrollToBottom('instant');
      }

      this.initializing = false;
    });
  }

  /** @internal Scroll to the bottom of the thread */
  scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    this.elementRef.nativeElement.scrollTo({
      top: this.elementRef.nativeElement.scrollHeight,
      behavior: this.initializing ? 'instant' : behavior,
    });
  }

  private updateIsAtBottom(): void {
    const scrollPosition =
      this.elementRef.nativeElement.scrollTop + this.elementRef.nativeElement.clientHeight;
    const scrollHeight = this.elementRef.nativeElement.scrollHeight;
    this.isAtBottom = scrollHeight - scrollPosition <= this.threshold();
  }
}
