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
import { NgpFocus, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpTextareaToken } from './textarea.token';

@Directive({
  standalone: true,
  selector: '[ngpTextarea]',
  exportAs: 'ngpTextarea',
  providers: [
    { provide: NgpTextareaToken, useExisting: NgpTextarea },
    { provide: NgpDisabledToken, useExisting: NgpTextarea },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpFocus, NgpPress],
})
export class NgpTextarea implements NgpCanDisable {
  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });
}
