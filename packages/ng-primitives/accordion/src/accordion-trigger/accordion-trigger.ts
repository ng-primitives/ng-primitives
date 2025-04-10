import { Directive, HostListener, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpAccordionItem } from '../accordion-item/accordion-item';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';

@Directive({
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
  host: {
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'accordionItem().open() ? "" : null',
    '[attr.data-disabled]': 'accordionItem().disabled() || accordion().disabled() ? "" : null',
    '[attr.aria-controls]': 'accordionItem().contentId()',
    '[attr.aria-expanded]': 'accordionItem().open()',
  },
})
export class NgpAccordionTrigger<T> {
  /**
   * Access the parent accordion.
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * The item instance.
   */
  protected readonly accordionItem = injectAccordionItemState<NgpAccordionItem<T>>();

  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  constructor() {
    this.accordionItem().trigger.set(this);
  }

  /**
   * Toggle the accordion item.
   */
  @HostListener('click')
  toggle(): void {
    if (this.accordionItem().disabled() || this.accordion().disabled()) {
      return;
    }

    this.accordion().toggle(this.accordionItem().value()!);
  }
}
