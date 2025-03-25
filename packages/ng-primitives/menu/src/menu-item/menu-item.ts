/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkMenuItem } from '@angular/cdk/menu';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpMenuItemToken } from './menu-item-token';

@Directive({
  selector: '[ngpMenuItem]',
  exportAs: 'ngpMenuItem',
  providers: [{ provide: NgpMenuItemToken, useExisting: NgpMenuItem }],
  hostDirectives: [
    { directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled:ngpMenuItemDisabled'] },
    NgpFocusVisible,
    NgpHover,
    NgpPress,
  ],
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class NgpMenuItem {
  /**
   * Whether the menu item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpMenuItemDisabled',
    transform: booleanAttribute,
  });
}
