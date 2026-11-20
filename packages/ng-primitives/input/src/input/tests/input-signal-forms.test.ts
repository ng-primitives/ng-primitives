import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, required } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { describe, expect, it } from 'vitest';

/** `ngpInput` composes `ngpFormControl`, so the signal-forms interop has to survive that. */

@Component({
  imports: [NgpInput, NgpFormField, NgpLabel, SignalFormField],
  template: `
    <div ngpFormField data-testid="field">
      <label id="name-label" ngpLabel>Name</label>
      <input id="name-input" [formField]="f.name" ngpInput data-testid="input" />
    </div>
  `,
})
class Host {
  readonly model = signal({ name: '' });
  readonly f = form(this.model, path => required(path.name));
}

@Component({
  imports: [NgpInput, SignalFormField],
  template: `
    <input [formField]="f.name" ngpInput data-testid="input" />
  `,
})
class DisabledHost {
  readonly model = signal({ name: 'Ada' });
  readonly f = form(this.model, path => disabled(path.name));
}

describe('NgpInput with signal forms', () => {
  it('should mirror the field status', async () => {
    const { getByTestId, fixture } = await render(Host);
    const input = getByTestId('input');

    expect(input).toHaveAttribute('data-invalid', '');
    expect(input).toHaveAttribute('data-pristine', '');

    fixture.componentInstance.model.set({ name: 'Ada' });
    await fixture.whenStable();

    expect(input).toHaveAttribute('data-valid', '');
    expect(input).not.toHaveAttribute('data-invalid');
  });

  it('should propagate the status to the surrounding form field', async () => {
    const { getByTestId } = await render(Host);

    expect(getByTestId('field')).toHaveAttribute('data-invalid', '');
  });

  it('should label the input from the form field', async () => {
    const { getByTestId } = await render(Host);

    expect(getByTestId('input')).toHaveAttribute('aria-labelledby', 'name-label');
  });

  it('should only advertise aria-invalid once touched', async () => {
    const { getByTestId, fixture } = await render(Host);
    const input = getByTestId('input');

    expect(input).not.toHaveAttribute('aria-invalid');

    fireEvent.blur(input);
    await fixture.whenStable();

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should disable the input when the field is disabled', async () => {
    const { getByTestId } = await render(DisabledHost);

    expect(getByTestId('input')).toBeDisabled();
    expect(getByTestId('input')).toHaveAttribute('data-disabled', '');
  });
});
