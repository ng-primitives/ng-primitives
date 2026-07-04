import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { SetterOptions } from 'ng-primitives/state';
import { injectToggleGroupConfig } from '../config/toggle-group-config';
import { ngpToggleGroup, provideToggleGroupState } from './toggle-group-state';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [provideToggleGroupState(), provideRovingFocusGroupState({ inherit: true })],
})
export class NgpToggleGroup<T = string> {
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
   * Whether focus should wrap around when reaching the end of the toggle group.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, {
    alias: 'ngpToggleGroupWrap',
    transform: booleanAttribute,
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
  readonly value = input<T[] | undefined>(undefined, { alias: 'ngpToggleGroupValue' });

  /**
   * The default selected value(s) for uncontrolled usage.
   * @default []
   */
  readonly defaultValue = input<T[]>([], { alias: 'ngpToggleGroupDefaultValue' });

  /**
   * Emits when the value of the toggle group changes.
   */
  readonly valueChange = output<T[]>({ alias: 'ngpToggleGroupValueChange' });

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
  protected readonly state = ngpToggleGroup<T>({
    rovingFocusGroup: ngpRovingFocusGroup({
      orientation: this.orientation,
      disabled: this.disabled,
      wrap: this.wrap,
    }),
    orientation: this.orientation,
    allowDeselection: this.allowDeselection,
    type: this.type,
    value: this.value,
    defaultValue: this.defaultValue,
    disabled: this.disabled,
    onValueChange: (value: T[]) => this.valueChange.emit(value),
  });

  /**
   * Toggle a value in the toggle group.
   */
  toggle(value: T): void {
    this.state.toggle(value);
  }

  /**
   * Set the value(s) of the toggle group.
   */
  setValue(newValue: T[], options?: SetterOptions): void {
    this.state.setValue(newValue, options);
  }

  /**
   * Set the default value(s) of the toggle group.
   */
  setDefaultValue(defaultValue: T[]): void {
    this.state.setDefaultValue(defaultValue);
  }

  /**
   * Set the disabled state of the toggle group.
   */
  setDisabled(isDisabled: boolean): void {
    this.state.setDisabled(isDisabled);
  }

  /**
   * Set the orientation of the toggle group.
   */
  setOrientation(newOrientation: NgpOrientation): void {
    this.state.setOrientation(newOrientation);
  }
}
