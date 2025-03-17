import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'app-checkbox',
  hostDirectives: [
    {
      directive: NgpCheckbox,
      inputs: [
        'ngpCheckboxChecked:checked',
        'ngpCheckboxIndeterminate:indeterminate',
        'ngpCheckboxDisabled:disabled',
      ],
      outputs: ['ngpCheckboxCheckedChange:checkedChange'],
    },
  ],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: Checkbox, multi: true }],
  template: ``,
  styles: ``,
})
export class Checkbox implements ControlValueAccessor {
  /** Defines whether the checkbox is checked. */
  readonly checked = model<boolean>(false);

  /** Defines whether the checkbox is indeterminate. */
  readonly indeterminate = model<boolean>(false);

  /** Defines whether the checkbox is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  writeValue(checked: boolean): void {
    throw new Error('Method not implemented.');
  }

  registerOnChange(fn: (checked: boolean) => void): void {
    throw new Error('Method not implemented.');
  }

  registerOnTouched(fn: () => void): void {
    throw new Error('Method not implemented.');
  }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
}
