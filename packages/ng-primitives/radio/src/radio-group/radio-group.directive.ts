/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, model } from '@angular/core';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { NgpRadioGroupToken } from './radio-group.token';

@Directive({
  selector: '[ngpRadioGroup]',
  standalone: true,
  providers: [{ provide: NgpRadioGroupToken, useExisting: NgpRadioGroup }],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'radiogroup',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class NgpRadioGroup {
  /**
   * The value of the radio group.
   */
  readonly value = model<string | null>(null, { alias: 'ngpRadioGroupValue' });

  /**
   * Whether the radio group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * The orientation of the radio group.
   * @default 'horizontal'
   */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal', {
    alias: 'ngpRadioGroupOrientation',
  });

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: string): void {
    this.value.set(value);
  }
}
