/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, model } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpCanOrientate, provideOrientation } from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { injectToggleGroupConfig } from '../config/toggle-group.config';
import { NgpToggleGroupToken } from './toggle-group.token';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [
    { provide: NgpToggleGroupToken, useExisting: NgpToggleGroup },
    provideOrientation(NgpToggleGroup),
  ],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'group',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-type]': 'type()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class NgpToggleGroup implements NgpCanOrientate {
  private readonly config = injectToggleGroupConfig();

  /**
   * The orientation of the toggle group.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpToggleGroupOrientation',
  });

  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   */
  readonly type = input<'single' | 'multiple'>(this.config.type, { alias: 'ngpToggleGroupType' });

  /**
   * The selected value(s) of the toggle group.
   */
  readonly value = model<string[]>([], { alias: 'ngpToggleGroupValue' });

  /**
   * Whether the toggle group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * Select a value in the toggle group.
   */
  private select(value: string): void {
    if (this.disabled()) {
      return;
    }

    if (this.type() === 'single') {
      this.value.set([value]);
    } else {
      this.value.update(values => [...values, value]);
    }
  }

  /**
   * De-select a value in the toggle group.
   */
  private deselect(value: string): void {
    if (this.disabled()) {
      return;
    }

    this.value.update(values => values.filter(v => v !== value));
  }

  /**
   * Check if a value is selected in the toggle group.
   * @internal
   */
  isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  /**
   * Toggle a value in the toggle group.
   * @internal
   */
  toggle(value: string): void {
    if (this.isSelected(value)) {
      this.deselect(value);
    } else {
      this.select(value);
    }
  }
}
