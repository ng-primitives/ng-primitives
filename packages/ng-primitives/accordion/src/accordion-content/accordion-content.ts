import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import type { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';

/**
 * Apply the `ngpAccordionContent` directive to an element that represents the content of an accordion item.
 */
@Directive({
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  host: {
    role: 'region',
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'accordionItem().open() ? "" : null',
    '[attr.aria-labelledby]': 'accordionItem().triggerId()',
  },
})
export class NgpAccordionContent<T> {
  /**
   * Access the accordion
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * Access the accordion item
   */
  protected readonly accordionItem = injectAccordionItemState();

  /**
   * The id of the content region
   */
  readonly id = input<string>(uniqueId('ngp-accordion-content'));

  constructor() {
    this.accordionItem().content.set(this);
  }
}
