import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectAccordionConfig } from '../config/accordion-config';
import { accordionState, provideAccordionState } from './accordion-state';

/**
 * Apply the `ngpAccordion` directive to an element that represents the group of accordion items.
 */
@Directive({
  selector: '[ngpAccordion]',
  exportAs: 'ngpAccordion',
  providers: [provideAccordionState()],
  host: {
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
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
  protected readonly state = accordionState<NgpAccordion<T>>(this);

  /**
   * @param value The value to check.
   * @returns Whether the value is open.
   * @internal
   */
  isOpen(value: T): boolean {
    if (this.state.type() === 'multiple') {
      return (this.state.value() as T[] | null)?.includes(value) ?? false;
    }

    return this.state.value() === value;
  }

  toggle(value: T): void {
    const isOpen = this.isOpen(value);

    // if we are in single mode and the value is already open and the accordion is not collapsible, do nothing
    if (this.state.type() === 'single' && isOpen && !this.state.collapsible()) {
      return;
    }

    // if we are in single mode then toggle the value
    if (this.state.type() === 'single') {
      const newValue = isOpen ? null : value;
      this.state.value.set(newValue);
      this.valueChange.emit(newValue);
      return;
    }

    // if we are in multiple mode then toggle the value
    let values = (this.state.value() as T[]) ?? [];

    if (isOpen) {
      values = values.filter(v => v !== value);
    } else {
      values = [...values, value];
    }
    this.state.value.set(values);
    this.valueChange.emit(values);
  }
}

export type NgpAccordionType = 'single' | 'multiple';
