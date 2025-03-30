/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpPopover, NgpPopoverTrigger, providePopoverTrigger } from 'ng-primitives/popover';
import { NgpRovingFocusGroup, provideRovingFocusGroup } from 'ng-primitives/roving-focus';

@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  hostDirectives: [NgpPopover, NgpRovingFocusGroup],
  providers: [
    // ensure we don't inherit the focus group from the parent menu if there is one
    provideRovingFocusGroup(NgpRovingFocusGroup, { inherit: false }),
    // Expose the popover trigger as a menu trigger
    providePopoverTrigger(NgpPopoverTrigger),
  ],
})
export class NgpMenu {}
