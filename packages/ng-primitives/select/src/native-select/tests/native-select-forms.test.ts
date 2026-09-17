import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField as SignalFormField, disabled, form } from '@angular/forms/signals';
import { render } from '@testing-library/angular';
import { NgpNativeSelect } from 'ng-primitives/select';
import { describe, expect, it } from 'vitest';

describe('NgpNativeSelect — reactive forms', () => {
  it('disables the select when the form control is disabled', async () => {
    const control = new FormControl({ value: '', disabled: true });
    const { getByTestId, fixture } = await render(
      `<select ngpNativeSelect data-testid="select" [formControl]="control"></select>`,
      { imports: [NgpNativeSelect, ReactiveFormsModule], componentProperties: { control } },
    );
    await fixture.whenStable();

    expect(getByTestId('select')).toBeDisabled();
    expect(getByTestId('select')).toHaveAttribute('data-disabled', '');
  });

  it('re-enables the select when the form control is enabled', async () => {
    const control = new FormControl({ value: '', disabled: true });
    const { getByTestId, fixture } = await render(
      `<select ngpNativeSelect data-testid="select" [formControl]="control"></select>`,
      { imports: [NgpNativeSelect, ReactiveFormsModule], componentProperties: { control } },
    );
    await fixture.whenStable();
    expect(getByTestId('select')).toBeDisabled();

    control.enable();
    await fixture.whenStable();

    expect(getByTestId('select')).not.toBeDisabled();
    expect(getByTestId('select')).not.toHaveAttribute('data-disabled');
  });

  it('stays disabled when its own disabled input is turned off but the control is disabled', async () => {
    const control = new FormControl({ value: '', disabled: true });
    const { getByTestId, fixture, rerender } = await render(
      `<select
         ngpNativeSelect
         data-testid="select"
         [ngpNativeSelectDisabled]="own"
         [formControl]="control"
       ></select>`,
      {
        imports: [NgpNativeSelect, ReactiveFormsModule],
        componentProperties: { own: true, control },
      },
    );
    await fixture.whenStable();
    expect(getByTestId('select')).toBeDisabled();

    // Turning off the primitive's own input must not override the form control.
    await rerender({ componentProperties: { own: false, control } });
    await fixture.whenStable();

    expect(getByTestId('select')).toBeDisabled();
  });

  it('disables the select from the ngpNativeSelectDisabled input', async () => {
    const { getByTestId } = await render(
      `<select ngpNativeSelect data-testid="select" [ngpNativeSelectDisabled]="true"></select>`,
      { imports: [NgpNativeSelect] },
    );

    expect(getByTestId('select')).toBeDisabled();
  });
});

@Component({
  imports: [NgpNativeSelect, SignalFormField],
  template: `
    <select [formField]="f.fruit" ngpNativeSelect data-testid="select"></select>
  `,
})
class SignalHost {
  readonly isDisabled = signal(false);
  readonly model = signal({ fruit: '' });
  readonly f = form(this.model, path => disabled(path.fruit, () => this.isDisabled()));
}

describe('NgpNativeSelect — signal forms', () => {
  it('disables the select when the field is disabled', async () => {
    const { getByTestId, fixture } = await render(SignalHost);
    await fixture.whenStable();

    expect(getByTestId('select')).not.toBeDisabled();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByTestId('select')).toBeDisabled();
    expect(getByTestId('select')).toHaveAttribute('data-disabled', '');
  });
});
