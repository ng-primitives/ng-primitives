import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectElementRef } from 'ng-primitives/internal';
import { injectProgressState } from '../progress/progress-state';

@Directive({
  selector: '[ngpProgressLabel]',
  exportAs: 'ngpProgressLabel',
  host: {
    '[attr.id]': 'id()',
    '[attr.for]': 'elementRef.nativeElement.tagName === "LABEL" ? id() : null',
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
   * Access the element ref.
   */
  protected readonly elementRef = injectElementRef();

  /**
   * The unique identifier for the progress label.
   */
  readonly id = input<string>(uniqueId('ngp-progress-label'));

  constructor() {
    this.state().label.set(this);
  }
}
