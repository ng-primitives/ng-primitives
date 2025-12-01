import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectAccordionConfig } from '../config/accordion-config';
import { ngpAccordion, NgpAccordionType, provideAccordionState } from './accordion-state';

/**
 * Apply the `ngpAccordion` directive to an element that represents the group of accordion items.
 */
@Directive({
  selector: '[ngpAccordion]',
  exportAs: 'ngpAccordion',
  providers: [provideAccordionState()],
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
  protected readonly state = ngpAccordion<T>({
    type: this.type,
    collapsible: this.collapsible,
    value: this.value,
    disabled: this.disabled,
    orientation: this.orientation,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * @param value The value to check.
   * @returns Whether the value is open.
   * @internal
   */
  isOpen(value: T): boolean {
    return this.state.isOpen(value);
  }

  toggle(value: T): void {
    this.state.toggle(value);
  }
}
