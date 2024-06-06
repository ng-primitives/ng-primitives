/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, computed, input } from '@angular/core';
import { NgpRovingFocusItem } from '@ng-primitives/ng-primitives/roving-focus';
import { injectRadioGroup } from '../radio-group/radio-group.token';
import { NgpRadioItemToken } from './radio-item.token';

@Directive({
  selector: '[ngpRadioItem]',
  standalone: true,
  hostDirectives: [NgpRovingFocusItem],
  providers: [{ provide: NgpRadioItemToken, useExisting: NgpRadioItem }],
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'checked() ? "true" : "false"',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
  },
})
export class NgpRadioItem {
  /**
   * Access the radio group.
   */
  private readonly radioGroup = injectRadioGroup();

  /**
   * The value of the radio item.
   */
  readonly value = input.required<string>({ alias: 'ngpRadioItemValue' });

  /**
   * Whether the radio item is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the radio item is checked.
   */
  readonly checked = computed(() => this.radioGroup.value() === this.value());

  /**
   * When the item receives focus, select it.
   * @internal
   */
  @HostListener('focus')
  protected onFocus(): void {
    this.radioGroup.select(this.value());
  }

  /**
   * When the item receives a click, select it.
   * @internal
   */
  @HostListener('click')
  protected onClick(): void {
    this.radioGroup.select(this.value());
  }
}
