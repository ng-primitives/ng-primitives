/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener } from '@angular/core';
import { injectSearchField } from '../search-field/search-field.token';
import { NgpSearchFieldClearToken } from './search-field-clear.token';

@Directive({
  standalone: true,
  selector: '[ngpSearchFieldClear]',
  exportAs: 'ngpSearchFieldClear',
  providers: [{ provide: NgpSearchFieldClearToken, useExisting: NgpSearchFieldClear }],
  host: {
    '[tabindex]': '-1',
    '[attr.data-empty]': 'searchField.empty()',
  },
})
export class NgpSearchFieldClear {
  /**
   * Access the Search Field instance.
   */
  protected readonly searchField = injectSearchField();

  /**
   * Clear the input field.
   */
  @HostListener('click')
  protected click(): void {
    this.searchField.clear();
  }
}
