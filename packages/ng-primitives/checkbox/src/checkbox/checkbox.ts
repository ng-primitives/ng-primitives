import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpCheckboxPattern, provideCheckboxPattern } from './checkbox-pattern';

/**
 * Apply the `ngpCheckbox` directive to an element to that represents the checkbox, such as a `button`.
 */
@Directive({
  selector: '[ngpCheckbox]',
  providers: [provideCheckboxPattern(NgpCheckbox, instance => instance.pattern)],
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
   * The pattern instance.
   */
  protected readonly pattern = ngpCheckboxPattern({
    id: this.id,
    checked: this.checked,
    indeterminate: this.indeterminate,
    required: this.required,
    disabled: this.disabled,
    onCheckedChange: (value: boolean) => this.checkedChange.emit(value),
    onIndeterminateChange: (value: boolean) => this.indeterminateChange.emit(value),
  });

  toggle(): void {
    this.pattern.toggle();
  }
}
