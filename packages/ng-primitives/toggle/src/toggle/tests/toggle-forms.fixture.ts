import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpButton } from 'ng-primitives/button';
import { ChangeFn, provideValueAccessor, safeTakeUntilDestroyed, TouchedFn } from 'ng-primitives/utils';
import { NgpToggle } from '../toggle';
import { injectToggleState } from '../toggle-state';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/toggle/toggle.ts`.
 * Used by the reusable-component test suites.
 */
@Component({
  selector: 'button[app-toggle]',
  hostDirectives: [
    {
      directive: NgpToggle,
      inputs: ['ngpToggleSelected:selected', 'ngpToggleDisabled:disabled'],
      outputs: ['ngpToggleSelectedChange:selectedChange'],
    },
    { directive: NgpButton, inputs: ['disabled'] },
  ],
  template: `
    <ng-content />
  `,
  providers: [provideValueAccessor(Toggle)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Toggle implements ControlValueAccessor {
  private readonly toggle = injectToggleState();
  private onChange?: ChangeFn<boolean>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.toggle()
      .selectedChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: boolean): void {
    this.toggle().setSelected(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<boolean>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.toggle().setDisabled(isDisabled);
  }
}
