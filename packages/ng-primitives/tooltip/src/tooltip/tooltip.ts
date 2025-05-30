import { Directive } from '@angular/core';
import { injectOverlay } from 'ng-primitives/portal';

/**
 * Apply the `ngpTooltip` directive to an element that represents the tooltip. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpTooltip]',
  exportAs: 'ngpTooltip',
  host: {
    role: 'tooltip',
    '[style.left.px]': 'overlay.position().x',
    '[style.top.px]': 'overlay.position().y',
    '[style.--ngp-tooltip-trigger-width.px]': 'overlay.triggerWidth()',
    '[style.--ngp-tooltip-transform-origin]': 'overlay.transformOrigin()',
  },
})
export class NgpTooltip {
  /**
   * Access the overlay.
   */
  protected readonly overlay = injectOverlay();
}
