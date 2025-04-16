import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnInit, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectRovingFocusGroupState, NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { provideRadioGroupState, radioGroupState } from './radio-group-state';

/**
 * Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.
 */
@Directive({
  selector: '[ngpRadioGroup]',
  providers: [provideRadioGroupState(), { provide: NgpDisabledToken, useExisting: NgpRadioGroup }],
  hostDirectives: [
    {
      directive: NgpRovingFocusGroup,
      inputs: [
        'ngpRovingFocusGroupOrientation:ngpRadioGroupOrientation',
        'ngpRovingFocusGroupDisabled:ngpRadioGroupDisabled',
      ],
    },
    NgpFormControl,
  ],
  host: {
    role: 'radiogroup',
    '[attr.aria-orientation]': 'state.orientation()',
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpRadioGroup<T> implements OnInit, NgpCanDisable {
  /**
   * Access the roving focus group state.
   */
  private readonly rovingFocusGroupState = injectRovingFocusGroupState();

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
   * The state of the radio group.
   * @internal
   */
  protected readonly state = radioGroupState<NgpRadioGroup<T>>(this);

  ngOnInit(): void {
    // the roving focus group defaults to vertical orientation whereas we want to default to vertical
    this.rovingFocusGroupState().orientation.set(this.state.orientation());
  }

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: T): void {
    this.state.value.set(value);
    this.valueChange.emit(value);
  }
}
