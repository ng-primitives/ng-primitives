import { Directive } from '@angular/core';
import { injectProgressState } from '../progress/progress-state';

/**
 * Apply the `ngpProgressIndicator` directive to an element that represents the current progress.
 * The width of this element can be set to the percentage of the progress value.
 */
@Directive({
  selector: '[ngpProgressIndicator]',
  host: {
    '[attr.data-state]': 'state().dataState()',
    '[attr.data-value]': 'state().value()',
    '[attr.data-max]': 'state().max()',
  },
})
export class NgpProgressIndicator {
  /**
   * Access the progress state.
   */
  protected readonly state = injectProgressState();
}
