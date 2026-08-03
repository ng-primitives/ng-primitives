import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, OnInit, output } from '@angular/core';
import { injectCheckboxGroupState } from 'ng-primitives/checkbox-group';
import { SetterOptions } from 'ng-primitives/state';
import { coerceBooleanOrUndefined, uniqueId } from 'ng-primitives/utils';
import { ngpCheckbox, provideCheckboxState } from './checkbox-state';

/**
 * Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.
 */
@Directive({
  selector: '[ngpCheckbox]',
  exportAs: 'ngpCheckbox',
  providers: [provideCheckboxState({ inherit: false })],
})
export class NgpCheckbox<T = string> implements OnInit {
  /**
   * The id of the checkbox.
   * @internal
   */
  readonly id = input(uniqueId('ngp-checkbox'));

  /**
   * Defines whether the checkbox is checked.
   */
  readonly checked = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpCheckboxChecked',
    transform: coerceBooleanOrUndefined,
  });

  /**
   * The default checked state for uncontrolled usage.
   * @default false
   */
  readonly defaultChecked = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxDefaultChecked',
    transform: booleanAttribute,
  });

  /**
   * The value represented by the checkbox when it belongs to a checkbox group.
   */
  readonly value = input<T | undefined>(undefined, { alias: 'ngpCheckboxValue' });

  /**
   * Whether the checkbox controls all values in its checkbox group.
   */
  readonly parent = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxParent',
    transform: booleanAttribute,
  });

  /**
   * The event that is emitted when the checkbox value changes.
   */
  readonly checkedChange = output<boolean>({
    alias: 'ngpCheckboxCheckedChange',
  });

  /**
   * Defines whether the checkbox is indeterminate.
   */
  readonly indeterminate = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxIndeterminate',
    transform: booleanAttribute,
  });

  /**
   * The event that is emitted when the indeterminate value changes.
   */
  readonly indeterminateChange = output<boolean>({
    alias: 'ngpCheckboxIndeterminateChange',
  });

  /**
   * Whether the checkbox is required.
   */
  readonly required = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxRequired',
    transform: booleanAttribute,
  });

  /**
   * Defines whether the checkbox is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the checkbox.
   */
  readonly state = ngpCheckbox({
    id: this.id,
    checked: this.checked,
    defaultChecked: this.defaultChecked,
    value: this.value,
    parent: this.parent,
    indeterminate: this.indeterminate,
    disabled: this.disabled,
    required: this.required,
    onCheckedChange: value => this.checkedChange.emit(value),
    onIndeterminateChange: value => this.indeterminateChange.emit(value),
  });

  private readonly group = injectCheckboxGroupState<T>({ optional: true });

  ngOnInit(): void {
    if (this.group() && !this.parent() && this.value() === undefined) {
      throw new Error('The `ngpCheckboxValue` input is required for a checkbox in a group.');
    }
  }

  toggle(event?: Event): void {
    this.state.toggle(event);
  }

  /**
   * Update the checked value.
   */
  setChecked(value: boolean, options?: SetterOptions): void {
    this.state.setChecked(value, options);
  }

  /**
   * Set the default checked state.
   */
  setDefaultChecked(value: boolean): void {
    this.state.setDefaultChecked(value);
  }

  /**
   * Update the indeterminate value.
   */
  setIndeterminate(value: boolean): void {
    this.state.setIndeterminate(value);
  }

  /**
   * Set the disabled value.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}
