/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive, inject, Injector } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

@Directive({
  selector: '[ngpMenuItem]',
  exportAs: 'ngpMenuItem',
  hostDirectives: [
    { directive: NgpButton, inputs: ['disabled: ngpMenuItemDisabled'] },
    NgpRovingFocusItem,
  ],
  host: {
    role: 'menuitem',
    '(click)': 'onClick($event)',
  },
})
export class NgpMenuItem {
  /** Access the injector */
  private readonly injector = inject(Injector);

  /** Access the popover the menu is part of */
  private readonly popover = injectPopoverTriggerState();

  /** Close the menu when the item is clicked */
  protected onClick(event: MouseEvent): void {
    // we do this here to avoid circular dependency issues
    const trigger = this.injector.get(NgpSubmenuTrigger, { optional: true });

    const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';

    // if this is a submenu trigger, we don't want to close the menu, we want to open the submenu
    if (!trigger) {
      this.popover().hide(origin);
    }
  }
}
