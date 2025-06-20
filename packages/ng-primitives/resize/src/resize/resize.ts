import { DestroyRef, Directive, ElementRef, NgZone, OnInit, inject, output } from '@angular/core';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { Dimensions, fromResizeEvent } from '../utils/resize';

/**
 * Apply the `ngpResize` directive to an element to listen for resize events.
 */
@Directive({
  selector: '[ngpResize]',
})
export class NgpResize implements OnInit {
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

  ngOnInit(): void {
    // oberve the element for resize events
    fromResizeEvent(this.element.nativeElement)
      .pipe(safeTakeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.ngZone.run(() => this.didResize.emit(event)));
  }
}
