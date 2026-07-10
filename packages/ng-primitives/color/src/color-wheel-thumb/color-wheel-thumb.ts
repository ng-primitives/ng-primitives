import { Directive } from '@angular/core';
import { ngpColorWheelThumb, provideColorWheelThumbState } from './color-wheel-thumb-state';

/**
 * Apply the `ngpColorWheelThumb` directive to the element that represents the color wheel thumb.
 * Position it with the `--ngp-color-wheel-hue` custom property, e.g.
 * `transform: translate(-50%, -50%) rotate(var(--ngp-color-wheel-hue)) translateY(calc(-1 * <radius>))`.
 */
@Directive({
  selector: '[ngpColorWheelThumb]',
  exportAs: 'ngpColorWheelThumb',
  providers: [provideColorWheelThumbState()],
})
export class NgpColorWheelThumb {
  constructor() {
    ngpColorWheelThumb({});
  }
}
