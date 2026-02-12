import { Directive, input } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { explicitEffect } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';

/**
 * Apply the `ngpPopover` directive to an element that represents the popover. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap],
  host: {
    role: 'dialog',
    '[id]': 'id()',
    '[style.left.px]': 'overlay.position().x',
    '[style.top.px]': 'overlay.position().y',
    '[style.--ngp-popover-trigger-width.px]': 'overlay.triggerWidth()',
    '[style.--ngp-popover-transform-origin]': 'overlay.transformOrigin()',
    '[style.--ngp-popover-available-width.px]': 'overlay.availableWidth()',
    '[style.--ngp-popover-available-height.px]': 'overlay.availableHeight()',
    '[attr.data-placement]': 'overlay.finalPlacement()',
    'data-overlay': '',
  },
})
export class NgpPopover {
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
  }
}
