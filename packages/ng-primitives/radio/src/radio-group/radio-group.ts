import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { uniqueId } from 'ng-primitives/utils';
import { ngpRadioGroupPattern, provideRadioGroupPattern } from './radio-group-pattern';

/**
 * Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.
 */
@Directive({
  selector: '[ngpRadioGroup]',
  providers: [provideRadioGroupPattern(NgpRadioGroup, instance => instance.pattern)],
  hostDirectives: [
    {
      directive: NgpRovingFocusGroup,
      inputs: [
        'ngpRovingFocusGroupOrientation:ngpRadioGroupOrientation',
        'ngpRovingFocusGroupDisabled:ngpRadioGroupDisabled',
      ],
    },
  ],
  host: {
    role: 'radiogroup',
    '[id]': 'id()',
  },
})
export class NgpRadioGroup<T> {
  /**
   * The id of the radio group. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-radio-group'));

  /**
   * The value of the radio group.
   */
  readonly value = input<T | null>(null, { alias: 'ngpRadioGroupValue' });

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
   * The pattern instance.
   */
  protected readonly pattern = ngpRadioGroupPattern({
    id: this.id,
    value: this.value,
    disabled: this.disabled,
    orientation: this.orientation,
    compareWith: this.compareWith,
    onValueChange: (value: T) => this.valueChange.emit(value),
  });

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: T): void {
    // if the value is already selected, do nothing
    if (this.pattern.compareWith()(this.pattern.value(), value)) {
      return;
    }

    // Instead of using pattern.select, directly handle the value change
    this.valueChange.emit(value);
  }
}
