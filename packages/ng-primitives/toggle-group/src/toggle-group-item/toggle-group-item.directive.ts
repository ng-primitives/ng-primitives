/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, OnInit } from '@angular/core';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectToggleGroup } from '../toggle-group/toggle-group.token';
import { NgpToggleGroupItemToken } from './toggle-group-item.token';

@Directive({
  standalone: true,
  selector: '[ngpToggleGroupItem]',
  exportAs: 'ngpToggleGroupItem',
  providers: [{ provide: NgpToggleGroupItemToken, useExisting: NgpToggleGroupItem }],
  hostDirectives: [NgpRovingFocusItem],
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'selected()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.aria-disabled]': 'disabled()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'toggle()',
  },
})
export class NgpToggleGroupItem implements OnInit {
  /**
   * Access the group that the item belongs to.
   */
  private readonly toggleGroup = injectToggleGroup();

  /**
   * The value of the item.
   */
  readonly value = input<string>(undefined, {
    alias: 'ngpToggleGroupItemValue',
  });

  /**
   * Whether the item is disabled.
   */
  protected readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the item is selected.
   */
  protected readonly selected = computed(() => this.toggleGroup.isSelected(this.value()!));

  ngOnInit(): void {
    // we can't use a required input for value as it is used in a computed property before the input is set
    if (this.value() === undefined) {
      throw new Error('The value input is required for the toggle group item.');
    }
  }

  /**
   * Toggle the item.
   */
  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.toggleGroup.toggle(this.value()!);
  }
}
