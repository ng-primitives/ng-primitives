import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpAccordionItemPattern, provideAccordionItemPattern } from './accordion-item-pattern';

/**
 * Apply the `ngpAccordionItem` directive to an element that represents an accordion item.
 */
@Directive({
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [provideAccordionItemPattern(NgpAccordionItem, instance => instance.pattern)],
})
export class NgpAccordionItem<T> {
  /**
   * The value of the accordion item.
   */
  readonly value = input<T>(uniqueId('ngp-accordion-item') as T, {
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
   * The accordion item pattern
   */
  readonly pattern = ngpAccordionItemPattern<T>({
    value: this.value,
    disabled: this.disabled,
  });

  /**
   * Expose the open state for convenience.
   */
  readonly open = this.pattern.open;
}
