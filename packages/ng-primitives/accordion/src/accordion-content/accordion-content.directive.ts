import { Directive, contentChild } from '@angular/core';
import { NgpAccordionTriggerToken } from '../accordion-trigger/accordion-trigger.token';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionContentToken } from './accordion-content.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  providers: [{ provide: NgpAccordionContentToken, useExisting: NgpAccordionContentDirective }],
  host: {
    role: 'region',
    '[attr.aria-labelledby]': 'trigger.id()',
    '[attr.data-orientation]': 'accordion.orientation()',
  },
})
export class NgpAccordionContentDirective {
  /**
   * Access the accordion
   */
  protected readonly accordion = injectAccordion();

  /**
   * Access the trigger
   */
  protected readonly trigger = contentChild(NgpAccordionTriggerToken);
}
