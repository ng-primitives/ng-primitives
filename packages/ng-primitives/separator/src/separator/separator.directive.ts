/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';

@Directive({
  selector: '[ngpSeparator]',
  standalone: true,
  host: {
    '[attr.role]': 'decorative ? "none" : "separator"',
    '[attr.aria-orientation]': '!decorative && orientation === "vertical" ? "vertical" : null',
    '[attr.data-orientation]': 'orientation',
  },
})
export class NgpSeparatorDirective {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /**
   * Whether the separator is for decoration purposes. If true, the separator will not be included in the accessibility tree.
   * @default false
   */
  readonly decorative = input<boolean, BooleanInput>(false, {
    alias: 'ngpSeparatorDecorative',
    transform: booleanAttribute,
  });
}
