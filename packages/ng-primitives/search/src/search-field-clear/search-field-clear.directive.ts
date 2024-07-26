/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener, inject } from '@angular/core';
import { NgpSearchField } from 'ng-primitives/search';

@Directive({
  standalone: true,
  selector: '[ngpSearchFieldClear]',
  exportAs: 'ngpSearchFieldClear',
  host: {
    '[attr.data-empty]': 'ngpSearchField.empty()',
  },
})
export class NgpSearchFieldClear {
  /**
   * Access the Search Field instance.
   */
  private readonly ngpSearchField = inject(NgpSearchField);

  /**
   * Clear the input field.
   */
  @HostListener('click')
  click(): void {
    this.ngpSearchField.clear();
  }
}
