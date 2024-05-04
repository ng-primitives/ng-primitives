/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectSelect } from '../select/select.token';
import { NgpSelectButtonToken } from './select-button.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectButton]',
  exportAs: 'ngpSelectButton',
  providers: [{ provide: NgpSelectButtonToken, useExisting: NgpSelectButtonDirective }],
  host: {
    '(click)': 'toggle()',
  },
})
export class NgpSelectButtonDirective {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<unknown>();

  /**
   * Toggle the select open state.
   */
  protected toggle() {
    this.select.open.update(open => !open);
  }
}
