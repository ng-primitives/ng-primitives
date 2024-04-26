/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, contentChild, input, model } from '@angular/core';
import { NgpCollapsibleContentToken } from '../collapsible-content/collapsible-content.token';
import { NgpCollapsibleToken } from './collapsible.token';

@Directive({
  standalone: true,
  selector: '[ngpCollapsible]',
  exportAs: 'ngpCollapsible',
  providers: [{ provide: NgpCollapsibleToken, useExisting: NgpCollapsibleDirective }],
  host: {
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class NgpCollapsibleDirective {
  /**
   * Whether the collapsible is open.
   */
  readonly open = model<boolean>(false, {
    alias: 'ngpCollapsibleOpen',
  });

  /**
   * Whether the collapsible is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCollapsibleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the collapsible content
   */
  private readonly content = contentChild(NgpCollapsibleContentToken);

  /**
   * Access the content id
   * @internal
   */
  readonly contentId = computed(() => this.content()?.id());

  /**
   * Toggle the collapsible
   */
  toggle(): void {
    this.open.update(open => !open);
  }
}
