import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { CheckboxFixture } from './checkbox-forms.fixture';

describe('Checkbox (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(
      `<app-checkbox [(ngModel)]="value"></app-checkbox>`,
      {
        imports: [CheckboxFixture, FormsModule],
        componentProperties: { value: true },
      },
    );

    await fixture.whenStable();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('binds with [(ngModel)] two-way on click', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture, rerender } = await render(
        `<app-checkbox [(ngModel)]="value" (ngModelChange)="ngModelChange($event)"></app-checkbox>`,
        {
          imports: [CheckboxFixture, FormsModule],
          componentProperties: { value: false, ngModelChange },
        },
      );

      await fixture.whenStable();
      const checkbox = getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      await fixture.whenStable();
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith(true);

      // writing a new value from the model must not re-emit through onChange
      await rerender({ componentProperties: { value: false, ngModelChange } });
      await fixture.whenStable();
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Checkbox (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl(true);
    const { getByRole } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    expect(formControl.value).toBe(true);
  });

  it('updates the form control on click and the DOM on setValue', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const checkbox = getByRole('checkbox');

    fireEvent.click(checkbox);
    expect(formControl.value).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    formControl.setValue(false);
    fixture.detectChanges();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('checkbox')).not.toHaveAttribute('data-disabled');

    formControl.disable();
    fixture.detectChanges();
    expect(getByRole('checkbox')).toHaveAttribute('data-disabled', '');
  });

  it('does not toggle while the form control is disabled', async () => {
    const formControl = new FormControl({ value: false, disabled: true });
    const { getByRole, fixture } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const checkbox = getByRole('checkbox');

    fireEvent.click(checkbox);
    expect(formControl.value).toBe(false);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // re-enabling the control restores interaction
    formControl.enable();
    fixture.detectChanges();

    fireEvent.click(checkbox);
    expect(formControl.value).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('checkbox'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('clears the checked state when the control is reset', async () => {
    const formControl = new FormControl(true);
    const { getByRole, fixture } = await render(
      `<app-checkbox [formControl]="formControl"></app-checkbox>`,
      {
        imports: [CheckboxFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');

    formControl.reset();
    fixture.detectChanges();

    expect(formControl.value).toBeNull();
    expect(getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl(false);
    const { fixture } = await render(`<app-checkbox [formControl]="formControl"></app-checkbox>`, {
      imports: [CheckboxFixture, ReactiveFormsModule],
      componentProperties: { formControl },
    });

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
