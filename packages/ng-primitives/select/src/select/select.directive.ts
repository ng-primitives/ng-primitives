/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpSelectToken } from './select.token';

@Directive({
  selector: 'select[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [
    { provide: NgpSelectToken, useExisting: NgpSelect },
    { provide: NgpDisabledToken, useExisting: NgpSelect },
  ],
  hostDirectives: [NgpFormControl, NgpFocusVisible, NgpHover, NgpPress],
  host: {
    '[attr.disabled]': 'disabled() || null',
  },
})
export class NgpSelect implements NgpCanDisable {
  /**
   * Whether the select is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });
}
