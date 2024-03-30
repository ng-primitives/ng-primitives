import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { NgpAccordionItemToken } from './accordion-item.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [{ provide: NgpAccordionItemToken, useExisting: NgpAccordionItemDirective }],
})
export class NgpAccordionItemDirective<T> {
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
}
