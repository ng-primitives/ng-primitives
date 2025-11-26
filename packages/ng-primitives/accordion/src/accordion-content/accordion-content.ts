import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpAccordionContent } from './accordion-content-state';

/**
 * Apply the `ngpAccordionContent` directive to an element that represents the content of an accordion item.
 */
@Directive({
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
})
export class NgpAccordionContent<T> {
  /**
   * The id of the content region
   */
  readonly id = input<string>(uniqueId('ngp-accordion-content'));

  constructor() {
    ngpAccordionContent<T>({ id: this.id });
  }
}
