/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, inject } from '@angular/core';
import { injectPopoverTriggerState, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpMenuToken } from '../menu/menu-token';

@Directive({
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTrigger:ngpMenuTrigger',
        'ngpPopoverTriggerDisabled:ngpMenuTriggerDisabled',
        'ngpPopoverTriggerPlacement:ngpMenuTriggerPlacement',
        'ngpPopoverTriggerOffset:ngpMenuTriggerOffset',
        'ngpPopoverTriggerShowDelay:ngpMenuTriggerShowDelay',
        'ngpPopoverTriggerHideDelay:ngpMenuTriggerHideDelay',
        'ngpPopoverTriggerFlip:ngpMenuTriggerFlip',
        'ngpPopoverTriggerContainer:ngpMenuTriggerContainer',
        'ngpPopoverTriggerScrollBehavior:ngpMenuTriggerScrollBehavior',
      ],
    },
  ],
  host: {
    'aria-haspopup': 'true',
    '(document:keydown.escape)': 'closeOnEscape()',
  },
})
export class NgpMenuTrigger {
  /** Access the popover trigger state */
  private readonly state = injectPopoverTriggerState();

  /** Access any parent menus */
  private readonly parentMenu = inject(NgpMenuToken, { optional: true });

  constructor() {
    // by default the popover opens below and to the center of the trigger,
    // but as this is a menu we want to default to opening below and to the start
    this.state().placement.set('bottom-start');
    // for menus we want to default to blocking the scroll behavior
    this.state().scrollBehavior.set('block');
  }

  /**
   * Close the menu and any parent menus
   */
  closeOnEscape(): void {
    this.parentMenu?.closeAllMenus('keyboard');
  }
}
