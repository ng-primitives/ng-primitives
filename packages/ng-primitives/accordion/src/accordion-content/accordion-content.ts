import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import {
  ngpAccordionContentPattern,
  provideAccordionContentPattern,
} from './accordion-content-pattern';

/**
 * Apply the `ngpAccordionContent` directive to an element that represents the content of an accordion item.
 */
@Directive({
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  providers: [provideAccordionContentPattern(NgpAccordionContent, instance => instance.pattern)],
})
export class NgpAccordionContent<T> {
  /**
   * The id of the content region
   */
  readonly id = input<string>(uniqueId('ngp-accordion-content'));

  /**
   * The accordion content pattern
   */
  readonly pattern = ngpAccordionContentPattern<T>({
    id: this.id,
  });
}
