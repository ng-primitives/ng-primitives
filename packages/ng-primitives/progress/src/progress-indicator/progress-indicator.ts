import { Directive } from '@angular/core';
import { injectProgressState } from '../progress/progress-state';

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
