import { Directive, output } from '@angular/core';
import { Dimensions } from 'ng-primitives/internal';
import { ngpResizePattern, provideResizePattern } from './resize-pattern';

/**
 * Apply the `ngpResize` directive to an element to listen for resize events.
 */
@Directive({
  selector: '[ngpResize]',
  providers: [provideResizePattern(NgpResize, instance => instance.pattern)],
})
export class NgpResize {
  /**
   * Emits when the element is resized.
   */
  readonly didResize = output<Dimensions>({
    alias: 'ngpResize',
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpResizePattern({
    onDidResize: (value: Dimensions) => this.didResize.emit(value),
  });
}
