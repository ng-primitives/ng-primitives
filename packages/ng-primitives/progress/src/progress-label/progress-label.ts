import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpProgressLabel } from './progress-label-state';

@Directive({
  selector: '[ngpProgressLabel]',
  exportAs: 'ngpProgressLabel',
})
export class NgpProgressLabel {
  /**
   * The unique identifier for the progress label.
   */
  readonly id = input<string>(uniqueId('ngp-progress-label'));

  constructor() {
    ngpProgressLabel({ id: this.id });
  }
}
