import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectProgressState } from '../progress/progress-state';

@Directive({
  selector: '[ngpProgressLabel]',
  exportAs: 'ngpProgressLabel',
  host: {
    '[attr.id]': 'id()',
    '[attr.data-progressing]': 'state().progressing() ? "" : null',
    '[attr.data-indeterminate]': 'state().indeterminate() ? "" : null',
    '[attr.data-complete]': 'state().complete() ? "" : null',
  },
})
export class NgpProgressLabel {
  /**
   * Access the progress state.
   */
  protected readonly state = injectProgressState();

  /**
   * The unique identifier for the progress label.
   */
  readonly id = input<string>(uniqueId('ngp-progress-label'));

  constructor() {
    this.state().label.set(this);
  }
}
