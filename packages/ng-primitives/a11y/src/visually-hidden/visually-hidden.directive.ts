/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[ngpVisuallyHidden]',
  exportAs: 'ngpVisuallyHidden',
  host: {
    style:
      'position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; white-space: nowrap; word-wrap: normal; outline: 0;-webkit-appearance: none;-moz-appearance: none;inset-inline-start: 0',
  },
})
export class NgpVisuallyHidden {}
