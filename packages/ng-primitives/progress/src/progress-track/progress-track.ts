import { Directive } from '@angular/core';
import { injectProgressState } from '../progress/progress-state';

@Directive({
  selector: '[ngpProgressTrack]',
  exportAs: 'ngpProgressTrack',
  host: {
    '[attr.data-progressing]': 'state().progressing() ? "" : null',
    '[attr.data-indeterminate]': 'state().indeterminate() ? "" : null',
    '[attr.data-complete]': 'state().complete() ? "" : null',
  },
})
export class NgpProgressTrack {
  /**
   * Access the progress state.
   */
  protected readonly state = injectProgressState();
}
