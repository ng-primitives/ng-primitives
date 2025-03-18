/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DestroyRef, Directive, ElementRef, NgZone, OnInit, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dimensions, fromResizeEvent } from '../utils/resize';

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
   * Emit when the element is resized.
   */
  readonly didResize = output<Dimensions>({
    alias: 'ngpResize',
  });

  ngOnInit(): void {
    // oberve the element for resize events
    fromResizeEvent(this.element.nativeElement)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.ngZone.run(() => this.didResize.emit(event)));
  }
}
