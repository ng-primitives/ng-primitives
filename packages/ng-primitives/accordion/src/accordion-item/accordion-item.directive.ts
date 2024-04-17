import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionItemToken } from './accordion-item.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [{ provide: NgpAccordionItemToken, useExisting: NgpAccordionItemDirective }],
  host: {
    '[attr.data-orientation]': 'accordion.orientation()',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() || accordion.disabled() ? "" : null',
  },
})
export class NgpAccordionItemDirective<T> {
  /**
   * Access the accordion.
   */
  protected readonly accordion = injectAccordion();

  /**
   * The value of the accordion item.
   */
  readonly value = input.required<T>({
    alias: 'ngpAccordionItemValue',
  });

  /**
   * Whether the accordion item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAccordionItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the accordion item is expanded.
   */
  protected readonly open = computed<boolean>(() => this.accordion.isOpen(this.value()));
}
