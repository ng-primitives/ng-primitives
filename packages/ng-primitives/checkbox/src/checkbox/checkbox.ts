import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpCheckbox, provideCheckboxState } from './checkbox-state';

/**
 * Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.
 */
@Directive({
  selector: '[ngpCheckbox]',
  providers: [provideCheckboxState({ inherit: false })],
})
export class NgpCheckbox {
  /**
   * The id of the checkbox.
   * @internal
   */
  readonly id = input(uniqueId('ngp-checkbox'));

  /**
   * Defines whether the checkbox is checked.
   */
  readonly checked = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxChecked',
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
  protected readonly state = ngpCheckbox({
    id: this.id,
    checked: this.checked,
    indeterminate: this.indeterminate,
    disabled: this.disabled,
    onCheckedChange: value => this.checkedChange.emit(value),
    onIndeterminateChange: value => this.indeterminateChange.emit(value),
  });

  toggle(event?: Event): void {
    this.state.toggle(event);
  }
}
