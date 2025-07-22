import { DestroyRef, Directive, ElementRef, NgZone, inject, output } from '@angular/core';
import { Dimensions, fromResizeEvent } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

/**
 * Apply the `ngpResize` directive to an element to listen for resize events.
 */
@Directive({
  selector: '[ngpResize]',
})
export class NgpResize {
  /**
   * Access the element.
   */
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access zone.js
   */
  private readonly ngZone = inject(NgZone);

  /**
   * Access the destroy ref
   */
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Emits when the element is resized.
   */
  readonly didResize = output<Dimensions>({
    alias: 'ngpResize',
  });

  constructor() {
    // observe the element for resize events
    fromResizeEvent(this.element.nativeElement)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.ngZone.run(() => this.didResize.emit(event)));
  }
}
