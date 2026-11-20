import { Component, signal } from '@angular/core';
import {
  FormField as SignalFormField,
  disabled,
  form,
  minLength,
  required,
} from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { InputOtpFixture } from './input-otp-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = '';

@Component({
  imports: [InputOtpFixture, SignalFormField],
  template: `
    <app-input-otp [length]="4" [formField]="f.code" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ code: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.code, () => this.isDisabled());
    required(path.code);
    // minLength ignores an empty value, so `required` covers the empty case.
    minLength(path.code, 4);
  });
}

function renderHost(code = '') {
  initialValue = code;
  return render(Host);
}

describe('InputOtp (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByTestId, fixture } = await renderHost('12');

    expect(getByTestId('slot-0')).toHaveTextContent('1');
    expect(getByTestId('slot-1')).toHaveTextContent('2');
    expect(fixture.componentInstance.f.code().value()).toBe('12');
  });

  it('updates the model on typing and the DOM on a model change', async () => {
    const { getByTestId, fixture } = await renderHost();
    const input = getByTestId('hidden-input');

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().code).toBe('12');

    fixture.componentInstance.model.set({ code: '34' });
    await fixture.whenStable();
    expect(getByTestId('slot-0')).toHaveTextContent('3');
    expect(getByTestId('slot-1')).toHaveTextContent('4');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByTestId, fixture } = await renderHost();
    await fixture.whenStable();

    expect(getByTestId('hidden-input')).not.toHaveAttribute('disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByTestId('hidden-input')).toHaveAttribute('disabled');
  });

  it('does not accept typing while the field is disabled', async () => {
    const { getByTestId, fixture } = await renderHost();
    const input = getByTestId('hidden-input');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().code).toBe('');
    expect(getByTestId('slot-0')).toHaveTextContent('');

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();
    expect(fixture.componentInstance.model().code).toBe('12');
    expect(getByTestId('slot-0')).toHaveTextContent('1');
  });

  it('marks the field as touched once the OTP is complete', async () => {
    const { getByTestId, fixture } = await renderHost();

    expect(fixture.componentInstance.f.code().touched()).toBe(false);

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '1234' } });
    await fixture.whenStable();

    expect(fixture.componentInstance.f.code().touched()).toBe(true);
  });

  it('clears the slots when the model is cleared', async () => {
    const { getByTestId, fixture } = await renderHost('12');
    expect(getByTestId('slot-0')).toHaveTextContent('1');

    fixture.componentInstance.model.set({ code: '' });
    await fixture.whenStable();

    expect(getByTestId('slot-0')).toHaveTextContent('');
    expect(getByTestId('slot-0')).not.toHaveAttribute('data-filled');
  });

  it('reports validation errors from the field', async () => {
    const { getByTestId, fixture } = await renderHost();
    const field = fixture.componentInstance.f.code;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('required');

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    await fixture.whenStable();
    expect(field().errors()[0].kind).toBe('minLength');

    fireEvent.input(input, { target: { value: '1234' } });
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});
