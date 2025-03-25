/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpFormControl } from 'ng-primitives/form-field';
import {
  NgpCanDisable,
  NgpCanOrientate,
  NgpDisabledToken,
  provideOrientation,
} from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { provideRadioGroupState, radioGroupState } from './radio-group-state';
import { provideRadioGroup } from './radio-group-token';

@Directive({
  selector: '[ngpRadioGroup]',
  providers: [
    provideRadioGroup(NgpRadioGroup),
    provideRadioGroupState(),
    provideOrientation(NgpRadioGroup),
    { provide: NgpDisabledToken, useExisting: NgpRadioGroup },
  ],
  hostDirectives: [NgpRovingFocusGroup, NgpFormControl],
  host: {
    role: 'radiogroup',
    '[attr.aria-orientation]': 'state.orientation()',
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpRadioGroup implements NgpCanDisable, NgpCanOrientate {
  /**
   * The value of the radio group.
   */
  readonly value = input<string | null>(null, { alias: 'ngpRadioGroupValue' });

  /**
   * Event emitted when the radio group value changes.
   */
  readonly valueChange = output<string | null>({
    alias: 'ngpRadioGroupValueChange',
  });

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
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpRadioGroupOrientation',
  });

  /**
   * The state of the radio group.
   * @internal
   */
  protected readonly state = radioGroupState<NgpRadioGroup>(this);

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: string): void {
    this.state.value.set(value);
    this.state.valueChange.emit(value);
  }
}
