import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import {
  ngpAccordionTriggerPattern,
  provideAccordionTriggerPattern,
} from './accordion-trigger-pattern';

/**
 * Apply the `ngpAccordionTrigger` directive to an element that represents the trigger for an accordion item, such as a button.
 */
@Directive({
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
  providers: [provideAccordionTriggerPattern(NgpAccordionTrigger, instance => instance.pattern)],
})
export class NgpAccordionTrigger<T> {
  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  /**
   * The accordion trigger pattern
   */
  readonly pattern = ngpAccordionTriggerPattern<T>({
    id: this.id,
  });
}
