/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpPopover } from 'ng-primitives/popover';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';

@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  hostDirectives: [NgpPopover, NgpRovingFocusGroup],
})
export class NgpMenu {}
