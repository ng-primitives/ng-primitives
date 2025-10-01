import { Directive, input } from '@angular/core';
import { ngpHoverInteraction } from 'ng-primitives/interactions';
import { explicitEffect } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';

/**
 * Apply the `ngpTooltip` directive to an element that represents the tooltip. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpTooltip]',
  exportAs: 'ngpTooltip',
  host: {
    role: 'tooltip',
    '[id]': 'id()',
    '[style.left.px]': 'overlay.position().x',
    '[style.top.px]': 'overlay.position().y',
    '[style.--ngp-tooltip-trigger-width.px]': 'overlay.triggerWidth()',
    '[style.--ngp-tooltip-transform-origin]': 'overlay.transformOrigin()',
    '[attr.data-placement]': 'overlay.finalPlacement()',
    'data-overlay': '',
  },
})
export class NgpTooltip {
  /**
   * Access the overlay.
   */
  protected readonly overlay = injectOverlay();

  /**
   * The unique id of the tooltip.
   */
  readonly id = input(this.overlay.id());

  constructor() {
    explicitEffect([this.id], ([id]) => this.overlay.id.set(id));

    // if the mouse moves over the tooltip, we want to keep it open
    ngpHoverInteraction({
      hoverStart: () => this.overlay.cancelPendingClose(),
      hoverEnd: () => this.overlay.hide(),
    });
  }
}
