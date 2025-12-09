import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDescription, provideDescriptionState } from './description-state';

/**
 * The `NgpDescription` directive is used to mark a description element within a form field. There may be multiple descriptions associated with a form control.
 */
@Directive({
  selector: '[ngpDescription]',
  exportAs: 'ngpDescription',
  providers: [provideDescriptionState()],
})
export class NgpDescription {
  /**
   * The id of the description. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-description'));

  /**
   * The description state.
   */
  constructor() {
    ngpDescription({ id: this.id });
  }
}
