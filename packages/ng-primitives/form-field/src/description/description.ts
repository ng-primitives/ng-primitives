import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpDescriptionPattern, provideDescriptionPattern } from './description-pattern';

/**
 * The `NgpDescription` directive is used to mark a description element within a form field. There may be multiple descriptions associated with a form control.
 */
@Directive({
  selector: '[ngpDescription]',
  exportAs: 'ngpDescription',
  providers: [provideDescriptionPattern(NgpDescription, instance => instance.pattern)],
})
export class NgpDescription {
  /**
   * The id of the description. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-description'));

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpDescriptionPattern({
    id: this.id,
  });
}
