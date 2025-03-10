/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, contentChild, Directive, HostListener } from '@angular/core';
import { NgpInputToken } from 'ng-primitives/input';
import { NgpSearchToken } from './search.token';

@Directive({
  standalone: true,
  selector: '[ngpSearch]',
  exportAs: 'ngpSearch',
  providers: [{ provide: NgpSearchToken, useExisting: NgpSearch }],
  host: {
    '[attr.data-empty]': 'empty() ? "" : null',
  },
})
export class NgpSearch {
  /**
   * Access the child input field.
   */
  protected readonly input = contentChild.required(NgpInputToken, { descendants: true });

  /**
   * Whether the input field is empty.
   * @internal
   */
  readonly empty = computed(() => this.input().value() === '');

  @HostListener('keydown.escape')
  clear(): void {
    this.input().setValue('');
  }
}
