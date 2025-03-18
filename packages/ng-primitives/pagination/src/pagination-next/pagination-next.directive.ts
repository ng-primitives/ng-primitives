/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, HostListener, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectPagination } from '../pagination/pagination.token';
import { NgpPaginationNextToken } from './pagination-next.token';

@Directive({
  selector: '[ngpPaginationNext]',
  exportAs: 'ngpPaginationNext',
  providers: [
    { provide: NgpPaginationNextToken, useExisting: NgpPaginationNext },
    { provide: NgpDisabledToken, useExisting: NgpPaginationNext },
  ],
  hostDirectives: [NgpButton],
  host: {
    '[tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-last-page]': 'pagination.lastPage() ? "" : null',
  },
})
export class NgpPaginationNext implements NgpCanDisable {
  /**
   * Access the pagination directive.
   */
  protected readonly pagination = injectPagination();

  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPaginationNextDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the button is disabled.
   */
  readonly disabled = computed(
    () => this.buttonDisabled() || this.pagination.state.disabled() || this.pagination.lastPage(),
  );

  /**
   * Go to the next page.
   */
  @HostListener('click')
  goToNextPage(): void {
    if (this.disabled()) {
      return;
    }

    this.pagination.goToPage(this.pagination.page() + 1);
  }

  /**
   * A click event may not be fired if this is on an anchor tag and the href is empty.
   * This is a workaround to ensure the click event is fired.
   */
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected onEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.goToNextPage();
  }
}
