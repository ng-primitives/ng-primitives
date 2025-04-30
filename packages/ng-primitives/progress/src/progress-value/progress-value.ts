import { Directive } from '@angular/core';
import { injectProgressState } from '../progress/progress-state';

@Directive({
  selector: '[ngpProgressValue]',
  exportAs: 'ngpProgressValue',
  host: {
    'aria-hidden': 'true',
    '[attr.data-progressing]': 'state().progressing() ? "" : null',
    '[attr.data-indeterminate]': 'state().indeterminate() ? "" : null',
    '[attr.data-complete]': 'state().complete() ? "" : null',
  },
})
export class NgpProgressValue {
  /**
   * Access the progress state.
   */
  protected readonly state = injectProgressState();
}
