import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, model } from '@angular/core';
import { NgpAccordionToken } from './accordion.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordion]',
  exportAs: 'ngpAccordion',
  providers: [{ provide: NgpAccordionToken, useExisting: NgpAccordionDirective }],
})
export class NgpAccordionDirective<T> {
  /**
   * The type of the accordion.
   */
  readonly type = input<'single' | 'multiple'>('single', {
    alias: 'ngpAccordionType',
  });

  /**
   * Whether the accordion is collapsible.
   */
  readonly collapsible = input<boolean, BooleanInput>(false, {
    alias: 'ngpAccordionCollapsible',
    transform: booleanAttribute,
  });

  /**
   * The value of the accordion.
   */
  readonly value = model<T | null>(null, {
    alias: 'ngpAccordionValue',
  });

  /**
   * Whether the accordion is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAccordionDisabled',
    transform: booleanAttribute,
  });

  /**
   * The accordion orientation.
   */
  readonly orientation = input<'horizontal' | 'vertical'>('vertical', {
    alias: 'ngpAccordionOrientation',
  });
}
