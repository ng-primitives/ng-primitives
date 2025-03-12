/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { injectSeparatorConfig } from '../config/separator.config';
import { NgpSeparatorToken } from './separator.token';

@Directive({
  standalone: true,
  selector: '[ngpSeparator]',
  exportAs: 'ngpSeparator',
  providers: [{ provide: NgpSeparatorToken, useExisting: NgpSeparator }],
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpSeparator {
  private readonly config = injectSeparatorConfig();

  /**
   * The orientation of the separator.
   */
  readonly orientation = input<'horizontal' | 'vertical'>(this.config.orientation, {
    alias: 'ngpSeparatorOrientation',
  });
}
