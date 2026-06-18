import { Directive, input } from '@angular/core';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { ngpTooltip } from './tooltip-state';

/**
 * Apply the `ngpTooltip` directive to an element that represents the tooltip. This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpTooltip]',
  exportAs: 'ngpTooltip',
  providers: [provideControlContainerIsolation()],
})
export class NgpTooltip {
  /**
   * The unique id of the tooltip.
   */
  readonly id = input('');

  protected readonly state = ngpTooltip({
    id: this.id,
  });
}
