import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionState } from '../accordion/accordion-state';
import { ngpAccordionItem, provideAccordionItemState } from './accordion-item-state';

/**
 * Apply the `ngpAccordionItem` directive to an element that represents an accordion item.
 */
@Directive({
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [provideAccordionItemState()],
})
export class NgpAccordionItem<T> {
  /**
   * Access the accordion.
   */
  protected readonly accordion = injectAccordionState<T>();

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
   * The accordion item state.
   */
  protected readonly state = ngpAccordionItem<T>({
    value: this.value,
    disabled: this.disabled,
  });

  /**
   * The open state of the accordion item.
   */
  readonly open = this.state.open;
}
