import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { InputOtpFixture } from './input-otp-forms.fixture';

describe('InputOtp (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value across the slots', async () => {
    const { getByTestId, fixture } = await render(
      `<app-input-otp [length]="4" [(ngModel)]="value" />`,
      {
        imports: [InputOtpFixture, FormsModule],
        componentProperties: { value: '12' },
      },
    );

    await fixture.whenStable();

    expect(getByTestId('slot-0')).toHaveTextContent('1');
    expect(getByTestId('slot-1')).toHaveTextContent('2');
    expect(getByTestId('slot-2')).toHaveTextContent('');
  });

  it('binds with [(ngModel)] two-way on typing', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByTestId, fixture, rerender } = await render(
        `<app-input-otp [length]="4" [(ngModel)]="value" (ngModelChange)="ngModelChange($event)" />`,
        {
          imports: [InputOtpFixture, FormsModule],
          componentProperties: { value: '', ngModelChange },
        },
      );

      await fixture.whenStable();
      const input = getByTestId('hidden-input');

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '12' } });
      await fixture.whenStable();

      expect(getByTestId('slot-0')).toHaveTextContent('1');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith('12');

      // writing a new value from the model must not re-emit through onChange
      await rerender({ componentProperties: { value: '34', ngModelChange } });
      await fixture.whenStable();
      expect(getByTestId('slot-0')).toHaveTextContent('3');
      expect(getByTestId('slot-1')).toHaveTextContent('4');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('InputOtp (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl('12');
    const { getByTestId } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByTestId('slot-0')).toHaveTextContent('1');
    expect(getByTestId('slot-1')).toHaveTextContent('2');
    expect(formControl.value).toBe('12');
  });

  it('updates the form control on typing and the DOM on setValue', async () => {
    const formControl = new FormControl<string | null>('');
    const { getByTestId, fixture } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    expect(formControl.value).toBe('12');

    formControl.setValue('34');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getByTestId('slot-0')).toHaveTextContent('3');
    expect(getByTestId('slot-1')).toHaveTextContent('4');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl('');
    const { getByTestId, fixture } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(getByTestId('hidden-input')).not.toHaveAttribute('disabled');

    formControl.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getByTestId('hidden-input')).toHaveAttribute('disabled');
  });

  it('does not accept typing while the form control is disabled', async () => {
    const formControl = new FormControl({ value: '', disabled: true });
    const { getByTestId, fixture } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const input = getByTestId('hidden-input');

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    expect(formControl.value).toBe('');
    expect(getByTestId('slot-0')).toHaveTextContent('');

    // re-enabling the control restores interaction
    formControl.enable();
    fixture.detectChanges();
    await fixture.whenStable();

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '12' } });
    expect(formControl.value).toBe('12');
    expect(getByTestId('slot-0')).toHaveTextContent('1');
  });

  it('marks the control as touched once the OTP is complete', async () => {
    const formControl = new FormControl('');
    const { getByTestId } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    const input = getByTestId('hidden-input');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '1234' } });

    expect(formControl.touched).toBe(true);
  });

  it('clears the slots when the control is reset', async () => {
    const formControl = new FormControl('12');
    const { getByTestId, fixture } = await render(
      `<app-input-otp [length]="4" [formControl]="formControl" />`,
      {
        imports: [InputOtpFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByTestId('slot-0')).toHaveTextContent('1');

    formControl.reset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(formControl.value).toBeNull();
    expect(getByTestId('slot-0')).toHaveTextContent('');
    expect(getByTestId('slot-0')).not.toHaveAttribute('data-filled');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string | null>('');
    const { fixture } = await render(`<app-input-otp [length]="6" [formControl]="formControl" />`, {
      imports: [InputOtpFixture, ReactiveFormsModule],
      componentProperties: { formControl },
    });

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue('123456');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('123456');
  });
});
