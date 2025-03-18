/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpCanOrientate, provideOrientation } from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { provideToolbar } from './toolbar.token';

@Directive({
  selector: '[ngpToolbar]',
  exportAs: 'ngpToolbar',
  providers: [provideToolbar(NgpToolbar), provideOrientation(NgpToolbar)],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'toolbar',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpToolbar implements NgpCanOrientate {
  /**
   * The orientation of the toolbar.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpToolbarOrientation',
  });
}
