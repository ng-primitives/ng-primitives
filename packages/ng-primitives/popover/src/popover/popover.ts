import { Directive, input } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpOverlayFinalFocus, provideControlContainerIsolation } from 'ng-primitives/portal';
import { ngpPopover, providePopoverState } from './popover-state';

/**
 * Apply the `ngpPopover` directive to an element that represents the popover. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpPopover]',
  exportAs: 'ngpPopover',
  hostDirectives: [NgpFocusTrap],
  providers: [providePopoverState(), provideControlContainerIsolation()],
})
export class NgpPopover {
  /**
   * The unique id of the tooltip.
   */
  readonly id = input('');

  /**
   * Where focus goes when the popover closes: an element, `false` to leave focus where it is,
   * `null` or `true` for the default (the element focused when it opened, usually the trigger),
   * or a function that receives the close origin and returns one of these.
   * @default null
   */
  readonly finalFocus = input<NgpOverlayFinalFocus | null>(null, {
    alias: 'ngpPopoverFinalFocus',
  });

  protected readonly state = ngpPopover({
    id: this.id,
    finalFocus: this.finalFocus,
  });
}
