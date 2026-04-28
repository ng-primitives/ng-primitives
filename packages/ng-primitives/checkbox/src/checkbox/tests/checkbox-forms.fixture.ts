import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor } from '@angular/forms';
import { injectCheckboxState, NgpCheckbox } from 'ng-primitives/checkbox';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

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
      outputs: [
        'ngpCheckboxCheckedChange:checkedChange',
        'ngpCheckboxIndeterminateChange:indeterminateChange',
      ],
    },
  ],
  providers: [provideValueAccessor(CheckboxFixture)],
  template: ``,
  host: { '(focusout)': 'onTouchedFn?.()' },
})
export class CheckboxFixture implements ControlValueAccessor {
  protected readonly state = injectCheckboxState();
  protected onChangeFn?: ChangeFn<boolean>;
  protected onTouchedFn?: TouchedFn;

  constructor() {
    this.state()
      .checkedChange.pipe(takeUntilDestroyed())
      .subscribe(checked => this.onChangeFn?.(checked));
  }

  writeValue(checked: boolean): void {
    this.state().setChecked(checked);
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
