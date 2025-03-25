/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, computed, input } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { injectRadioGroupState } from '../radio-group/radio-group-state';
import { injectRadioGroup } from '../radio-group/radio-group-token';
import { provideRadioItemState, radioItemState } from './radio-item-state';
import { provideRadioItem } from './radio-item-token';

@Directive({
  selector: '[ngpRadioItem]',
  hostDirectives: [NgpRovingFocusItem, NgpHover, NgpFocusVisible, NgpPress],
  providers: [provideRadioItem(NgpRadioItem), provideRadioItemState()],
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'checked() ? "true" : "false"',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.data-checked]': 'checked() ? "" : null',
  },
})
export class NgpRadioItem {
  /**
   * Access the radio group.
   */
  private readonly radioGroup = injectRadioGroup();
  /**
   * Access the radio group state.
   */
  private readonly radioGroupState = injectRadioGroupState();

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
  readonly checked = computed(() => this.radioGroupState.value() === this.value());

  /**
   * The state of the radio item.
   */
  protected readonly state = radioItemState<NgpRadioItem>(this);

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
