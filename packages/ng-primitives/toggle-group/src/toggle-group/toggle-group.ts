import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { injectToggleGroupConfig } from '../config/toggle-group-config';
import { ngpToggleGroup, provideToggleGroupState } from './toggle-group-state';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [provideToggleGroupState(), provideRovingFocusGroupState({ inherit: true })],
})
export class NgpToggleGroup {
  /**
   * Access the global toggle group configuration.
   */
  private readonly config = injectToggleGroupConfig();

  /**
   * The orientation of the toggle group.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpToggleGroupOrientation',
  });

  /**
   * Whether toggle buttons can be deselected. If set to `false`, clicking a selected toggle button will not deselect it.
   * @default true
   */
  readonly allowDeselection = input<boolean, BooleanInput>(this.config.allowDeselection, {
    alias: 'ngpToggleGroupAllowDeselection',
    transform: booleanAttribute,
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
  protected readonly state = ngpToggleGroup({
    rovingFocusGroup: ngpRovingFocusGroup({
      orientation: this.state.orientation,
      disabled: this.state.disabled,
    }),
    orientation: this.state.orientation,
    allowDeselection: this.state.allowDeselection,
    type: this.state.type,
    value: this.state.value,
    disabled: this.state.disabled,
    onValueChange: (value: string[]) => {
      this.valueChange.emit(value);
    },
  });

  /**
   * Toggle a value in the toggle group.
   */
  toggle(value: string): void {
    this.state.toggle(value);
  }
}
