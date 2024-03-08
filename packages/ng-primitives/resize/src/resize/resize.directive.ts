import {
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResizeEvent, fromResizeEvent } from '../utils/resize';

@Directive({
  selector: '[ngpResize]',
  standalone: true,
})
export class NgpResizeDirective implements OnInit {
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
  @Output('ngpResize') readonly didResize = new EventEmitter<ResizeEvent>();

  ngOnInit(): void {
    // oberve the element for resize events
    fromResizeEvent(this.element.nativeElement)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => this.ngZone.run(() => this.didResize.emit(event)));
  }
}
