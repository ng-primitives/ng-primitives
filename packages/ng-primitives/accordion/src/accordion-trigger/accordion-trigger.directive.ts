import { Directive, HostListener, input } from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectAccordionItem } from '../accordion-item/accordion-item.token';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionTriggerToken } from './accordion-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
  providers: [{ provide: NgpAccordionTriggerToken, useExisting: NgpAccordionTriggerDirective }],
  host: {
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion.orientation()',
    '[attr.data-state]': 'item.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'item.disabled() || accordion.disabled() ? "" : null',
    '[attr.aria-controls]': 'item.contentId()',
    '[attr.aria-expanded]': 'item.open()',
  },
})
export class NgpAccordionTriggerDirective {
  /**
   * Access the parent accordion.
   */
  protected readonly accordion = injectAccordion();

  /**
   * The item instance.
   */
  protected readonly item = injectAccordionItem();

  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  /**
   * Toggle the accordion item.
   */
  @HostListener('click')
  toggle(): void {
    this.accordion.toggle(this.item.value());
  }
}
