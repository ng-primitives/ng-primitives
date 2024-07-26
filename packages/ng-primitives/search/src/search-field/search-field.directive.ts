/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { computed, contentChild, Directive, HostListener } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';
import { NgpInputToken } from 'ng-primitives/input';
import { NgpSearchFieldToken } from './search-field.token';

@Directive({
  standalone: true,
  selector: '[ngpSearchField]',
  exportAs: 'ngpSearchField',
  providers: [{ provide: NgpSearchFieldToken, useExisting: NgpSearchField }],
  hostDirectives: [NgpFormField],
  host: {
    '[attr.data-empty]': 'empty()',
  },
})
export class NgpSearchField {
  /**
   * Access the child input field.
   */
  protected readonly input = contentChild.required(NgpInputToken, { descendants: true });

  /**
   * Whether the input field is empty.
   */
  protected readonly empty = computed(() => this.input().value() === '');

  @HostListener('keydown.escape')
  clear(): void {
    this.input().value.set('');
  }
}
