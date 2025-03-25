/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpCanOrientate, provideOrientation } from 'ng-primitives/internal';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { injectToggleGroupConfig } from '../config/toggle-group-config';
import { provideToggleGroupState, toggleGroupState } from './toggle-group-state';
import { provideToggleGroup } from './toggle-group-token';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [
    provideToggleGroup(NgpToggleGroup),
    provideOrientation(NgpToggleGroup),
    provideToggleGroupState(),
  ],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'group',
    '[attr.aria-orientation]': 'state.orientation()',
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-type]': 'state.type()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpToggleGroup implements NgpCanOrientate {
  private readonly config = injectToggleGroupConfig();

  /**
   * The orientation of the toggle group.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpToggleGroupOrientation',
  });

  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   */
  readonly type = input<'single' | 'multiple'>(this.config.type, { alias: 'ngpToggleGroupType' });

  /**
   * The selected value(s) of the toggle group.
   */
  readonly value = input<string[]>([], { alias: 'ngpToggleGroupValue' });

  /**
   * Emits when the value of the toggle group changes.
   */
  readonly valueChange = output<string[]>({ alias: 'ngpToggleGroupValueChange' });

  /**
   * Whether the toggle group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the toggle group.
   */
  protected readonly state = toggleGroupState({
    value: this.value,
    valueChange: this.valueChange,
    orientation: this.orientation,
    type: this.type,
    disabled: this.disabled,
  });

  /**
   * Select a value in the toggle group.
   */
  private select(value: string): void {
    if (this.state.disabled()) {
      return;
    }

    if (this.type() === 'single') {
      this.state.value.set([value]);
    } else {
      this.state.value.set([...this.state.value(), value]);
    }

    this.state.valueChange.emit(this.state.value());
  }

  /**
   * De-select a value in the toggle group.
   */
  private deselect(value: string): void {
    if (this.state.disabled()) {
      return;
    }

    this.state.value.set(this.state.value().filter(v => v !== value));
    this.state.valueChange.emit(this.state.value());
  }

  /**
   * Check if a value is selected in the toggle group.
   * @internal
   */
  isSelected(value: string): boolean {
    return this.state.value()?.includes(value) ?? false;
  }

  /**
   * Toggle a value in the toggle group.
   * @internal
   */
  toggle(value: string): void {
    if (this.isSelected(value)) {
      this.deselect(value);
    } else {
      this.select(value);
    }
  }
}
