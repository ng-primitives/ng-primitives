import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectAccordionConfig } from '../config/accordion-config';
import {
  ngpAccordionPattern,
  NgpAccordionType,
  provideAccordionPattern,
} from './accordion-pattern';

/**
 * Apply the `ngpAccordion` directive to an element that represents the group of accordion items.
 */
@Directive({
  selector: '[ngpAccordion]',
  exportAs: 'ngpAccordion',
  providers: [provideAccordionPattern(NgpAccordion, m => m.pattern)],
})
export class NgpAccordion<T> {
  /**
   * Access the global accordion configuration.
   */
  private readonly config = injectAccordionConfig();

  /**
   * The type of the accordion.
   */
  readonly type = input<NgpAccordionType>(this.config.type, {
    alias: 'ngpAccordionType',
  });

  /**
   * Whether the accordion is collapsible.
   */
  readonly collapsible = input<boolean, BooleanInput>(this.config.collapsible, {
    alias: 'ngpAccordionCollapsible',
    transform: booleanAttribute,
  });

  /**
   * The value of the accordion.
   */
  readonly value = input<T | T[] | null>(null, {
    alias: 'ngpAccordionValue',
  });

  /**
   * Event emitted when the accordion value changes.
   */
  readonly valueChange = output<T | T[] | null>({
    alias: 'ngpAccordionValueChange',
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
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpAccordionOrientation',
  });

  /**
   * The accordion state.
   */
  protected readonly pattern = ngpAccordionPattern({
    type: this.type,
    collapsible: this.collapsible,
    disabled: this.disabled,
    value: this.value,
    valueChange: this.valueChange,
    orientation: this.orientation,
  });
}
