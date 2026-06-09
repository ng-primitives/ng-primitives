import { Directive, input } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
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

  protected readonly state = ngpPopover({
    id: this.id,
  });
}
