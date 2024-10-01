/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, model } from '@angular/core';
import { injectAccordionConfig } from '../config/accordion.config';
import { NgpAccordionToken } from './accordion.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordion]',
  exportAs: 'ngpAccordion',
  providers: [{ provide: NgpAccordionToken, useExisting: NgpAccordion }],
  host: {
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
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
  readonly value = model<T | T[] | null>(null, {
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
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation, {
    alias: 'ngpAccordionOrientation',
  });

  /**
   * @param value The value to check.
   * @returns Whether the value is open.
   * @internal
   */
  isOpen(value: T): boolean {
    if (this.type() === 'multiple') {
      return (this.value() as T[] | null)?.includes(value) ?? false;
    }

    return this.value() === value;
  }

  toggle(value: T): void {
    const isOpen = this.isOpen(value);

    // if we are in single mode and the value is already open and the accordion is not collapsible, do nothing
    if (this.type() === 'single' && isOpen && !this.collapsible()) {
      return;
    }

    // if we are in single mode then toggle the value
    if (this.type() === 'single') {
      this.value.set(isOpen ? null : value);
      return;
    }

    // if we are in multiple mode then toggle the value
    const values = (this.value() as T[]) ?? [];

    if (isOpen) {
      this.value.set(values.filter(v => v !== value));
    } else {
      this.value.set([...values, value]);
    }
  }
}

export type NgpAccordionType = 'single' | 'multiple';
