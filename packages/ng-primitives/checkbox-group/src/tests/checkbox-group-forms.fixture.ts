import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { injectCheckboxGroupState, NgpCheckboxGroup } from 'ng-primitives/checkbox-group';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';

@Component({
  selector: 'app-checkbox-group',
  hostDirectives: [
    {
      directive: NgpCheckboxGroup,
      inputs: [
        'ngpCheckboxGroupValue:value',
        'ngpCheckboxGroupDefaultValue:defaultValue',
        'ngpCheckboxGroupAllValues:allValues',
        'ngpCheckboxGroupDisabled:disabled',
      ],
      outputs: ['ngpCheckboxGroupValueChange:valueChange'],
    },
  ],
  providers: [provideValueAccessor(CheckboxGroupFixture)],
  template: '<ng-content />',
  host: { '(focusout)': 'onTouched?.()' },
})
export class CheckboxGroupFixture implements ControlValueAccessor {
  private readonly state = injectCheckboxGroupState<string>();
  private onChange?: ChangeFn<string[]>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.state()
      .valueChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: string[] | null): void {
    this.state().setValue(value ?? [], { emit: false });
  }

  registerOnChange(onChange: ChangeFn<string[]>): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: TouchedFn): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
