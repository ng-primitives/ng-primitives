import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { ngpRadioGroup, provideRadioGroupState } from './radio-group-state';

/**
 * Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.
 */
@Directive({
  selector: '[ngpRadioGroup]',
  providers: [provideRadioGroupState(), provideRovingFocusGroupState()],
})
export class NgpRadioGroup<T> {
  /**
   * The id of the radio group. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-radio-group'));

  /**
   * The value of the radio group. Leave unset for uncontrolled usage.
   */
  readonly value = input<T | null | undefined>(undefined, { alias: 'ngpRadioGroupValue' });

  /**
   * The default value of the radio group for uncontrolled usage.
   */
  readonly defaultValue = input<T | null>(null, { alias: 'ngpRadioGroupDefaultValue' });

  /**
   * Event emitted when the radio group value changes.
   */
  readonly valueChange = output<T | null>({
    alias: 'ngpRadioGroupValueChange',
  });

  /**
   * Whether the radio group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * The orientation of the radio group.
   * @default 'horizontal'
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpRadioGroupOrientation',
  });

  /**
   * The comparator function for the radio group. This is useful if values are objects and you want to compare them by value, not by reference.
   * @default (a, b) => a === b
   */
  readonly compareWith = input<(a: T | null, b: T | null) => boolean>((a, b) => a === b, {
    alias: 'ngpRadioGroupCompareWith',
  });

  /**
   * The state of the radio group.
   */
  protected readonly state = ngpRadioGroup({
    id: this.id,
    value: this.value,
    defaultValue: this.defaultValue,
    disabled: this.disabled,
    orientation: this.orientation,
    compareWith: this.compareWith,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: T): void {
    this.state.select(value);
  }

  /**
   * Set the default value of the radio group.
   */
  setDefaultValue(value: T | null): void {
    this.state.setDefaultValue(value);
  }

  /**
   * Set the orientation of the radio group.
   */
  setOrientation(orientation: NgpOrientation): void {
    this.state.setOrientation(orientation);
  }
}
