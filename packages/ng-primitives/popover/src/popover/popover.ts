import { Directive } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';

/**
 * Apply the `ngpPopover` directive to an element that represents the popover. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap, NgpExitAnimation],
  host: {
    role: 'dialog',
    '[style.left.px]': 'overlay.position().x',
    '[style.top.px]': 'overlay.position().y',
    '[style.--ngp-popover-trigger-width.px]': 'overlay.triggerWidth()',
    '[style.--ngp-popover-transform-origin]': 'overlay.transformOrigin()',
  },
})
export class NgpPopover {
  /**
   * Access the overlay.
   */
  protected readonly overlay = injectOverlay();
}
