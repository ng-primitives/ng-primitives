import { Directive } from '@angular/core';
import { ngpColorAreaThumb, provideColorAreaThumbState } from './color-area-thumb-state';

/**
 * Apply the `ngpColorAreaThumb` directive to the element that represents the color area thumb.
 */
@Directive({
  selector: '[ngpColorAreaThumb]',
  exportAs: 'ngpColorAreaThumb',
  providers: [provideColorAreaThumbState()],
})
export class NgpColorAreaThumb {
  constructor() {
    ngpColorAreaThumb({});
  }
}
