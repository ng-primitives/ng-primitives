/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusOrigin } from '@angular/cdk/a11y';
import { Directive } from '@angular/core';
import { injectPopoverTriggerState, NgpPopoverTrigger } from 'ng-primitives/popover';

@Directive({
  selector: '[ngpSubmenuTrigger]',
  exportAs: 'ngpSubmenuTrigger',
  hostDirectives: [
    { directive: NgpPopoverTrigger, inputs: ['ngpPopoverTrigger:ngpSubmenuTrigger'] },
  ],
})
export class NgpSubmenuTrigger {
  /** Access the popover trigger state */
  private readonly state = injectPopoverTriggerState();

  constructor() {
    // by default the popover opens below and to the center of the trigger,
    // but as this is a submenu we want to default to opening to the right
    // and to the start
    this.state().placement.set('right-start');
  }

  openMenu(origin: FocusOrigin): void {
    this.state().show(origin);
  }
}
