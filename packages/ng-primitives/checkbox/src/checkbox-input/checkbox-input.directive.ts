/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpVisuallyHidden } from 'ng-primitives/a11y';
import { injectCheckbox } from '../checkbox/checkbox.token';

@Directive({
  standalone: true,
  selector: 'input[ngpCheckboxInput]',
  exportAs: 'ngpCheckboxInput',
  hostDirectives: [NgpVisuallyHidden],
  host: {
    type: 'checkbox',
    tabindex: '-1',
    '[attr.aria-hidden]': 'true',
    '[checked]': 'checkbox.checked()',
    '[disabled]': 'checkbox.disabled()',
    '[required]': 'checkbox.required()',
  },
})
export class NgpCheckboxInput {
  /**
   * Access the checkbox instance
   */
  protected readonly checkbox = injectCheckbox();
}
