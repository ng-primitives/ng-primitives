import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnInit, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { injectRovingFocusGroupState, NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { provideRadioGroupState, radioGroupState } from './radio-group-state';
import { provideRadioGroup } from './radio-group-token';

/**
 * Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.
 */
@Directive({
  selector: '[ngpRadioGroup]',
  providers: [
    provideRadioGroup(NgpRadioGroup),
    provideRadioGroupState(),
    { provide: NgpDisabledToken, useExisting: NgpRadioGroup },
  ],
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
export class NgpRadioGroup implements OnInit, NgpCanDisable {
  /**
   * Access the roving focus group state.
   */
  private readonly rovingFocusGroupState = injectRovingFocusGroupState();

  /**
   * The value of the radio group.
   */
  readonly value = input<string | null>(null, { alias: 'ngpRadioGroupValue' });

  /**
   * Event emitted when the radio group value changes.
   */
  readonly valueChange = output<string | null>({
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
   * The state of the radio group.
   * @internal
   */
  protected readonly state = radioGroupState<NgpRadioGroup>(this);

  ngOnInit(): void {
    // the roving focus group defaults to vertical orientation whereas we want to default to vertical
    this.rovingFocusGroupState().orientation.set(this.state.orientation());
  }

  /**
   * Select a radio item.
   * @param value The value of the radio item to select.
   */
  select(value: string): void {
    this.state.value.set(value);
    this.valueChange.emit(value);
  }
}
