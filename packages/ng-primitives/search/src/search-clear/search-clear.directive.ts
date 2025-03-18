/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener } from '@angular/core';
import { injectSearch } from '../search/search.token';
import { NgpSearchClearToken } from './search-clear.token';

@Directive({
  selector: '[ngpSearchClear]',
  exportAs: 'ngpSearchClear',
  providers: [{ provide: NgpSearchClearToken, useExisting: NgpSearchClear }],
  host: {
    '[tabindex]': '-1',
    '[attr.data-empty]': 'search.empty() ? "" : null',
  },
})
export class NgpSearchClear {
  /**
   * Access the Search instance.
   */
  protected readonly search = injectSearch();

  /**
   * Clear the input field.
   */
  @HostListener('click')
  protected click(): void {
    this.search.clear();
  }
}
