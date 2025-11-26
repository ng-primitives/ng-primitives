import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpAccordionTrigger } from './accordion-trigger-state';

/**
 * Apply the `ngpAccordionTrigger` directive to an element that represents the trigger for an accordion item, such as a button.
 */
@Directive({
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
})
export class NgpAccordionTrigger<T> {
  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  private readonly state = ngpAccordionTrigger<T>({ id: this.id });

  /**
   * Toggle the accordion item.
   */
  toggle(): void {
    this.state.toggle();
  }
}
