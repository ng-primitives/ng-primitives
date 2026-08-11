import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';
import { injectSwitchState } from '../switch-state';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/switch/switch.ts`.
 * Used by the reusable-component test suites.
 */
@Component({
  selector: 'app-switch',
  hostDirectives: [
    {
      directive: NgpSwitch,
      inputs: ['ngpSwitchChecked:checked', 'ngpSwitchDisabled:disabled'],
      outputs: ['ngpSwitchCheckedChange:checkedChange'],
    },
  ],
  imports: [NgpSwitchThumb],
  template: `
    <span ngpSwitchThumb></span>
  `,
  providers: [provideValueAccessor(Switch)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Switch implements ControlValueAccessor {
  private readonly switch = injectSwitchState();
  private onChange?: ChangeFn<boolean>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.switch()
      .checkedChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: boolean): void {
    // writing a value from the model must not re-emit through onChange
    this.switch().setChecked(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.switch().setDisabled(isDisabled);
  }
}
