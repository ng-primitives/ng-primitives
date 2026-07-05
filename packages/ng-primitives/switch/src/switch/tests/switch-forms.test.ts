import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './switch-forms.fixture';

describe('Switch (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(`<app-switch [(ngModel)]="value"></app-switch>`, {
      imports: [Switch, FormsModule],
      componentProperties: { value: true },
    });

    await fixture.whenStable();
    expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('binds with [(ngModel)] two-way on click', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture, rerender } = await render(
        `<app-switch [(ngModel)]="value" (ngModelChange)="ngModelChange($event)"></app-switch>`,
        {
          imports: [Switch, FormsModule],
          componentProperties: { value: false, ngModelChange },
        },
      );

      await fixture.whenStable();
      const el = getByRole('switch');
      expect(el).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(el);
      await fixture.whenStable();
      expect(el).toHaveAttribute('aria-checked', 'true');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith(true);

      // writing a new value from the model must not re-emit through onChange
      await rerender({ componentProperties: { value: false, ngModelChange } });
      await fixture.whenStable();
      expect(el).toHaveAttribute('aria-checked', 'false');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Switch (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl(true);
    const { getByRole } = await render(`<app-switch [formControl]="formControl"></app-switch>`, {
      imports: [Switch, ReactiveFormsModule],
      componentProperties: { formControl },
    });

    expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(formControl.value).toBe(true);
  });

  it('updates the form control on click and the DOM on setValue', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-switch [formControl]="formControl"></app-switch>`,
      {
        imports: [Switch, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const el = getByRole('switch');

    fireEvent.click(el);
    expect(formControl.value).toBe(true);
    expect(el).toHaveAttribute('aria-checked', 'true');

    formControl.setValue(false);
    fixture.detectChanges();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-switch [formControl]="formControl"></app-switch>`,
      {
        imports: [Switch, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('switch')).not.toHaveAttribute('data-disabled');

    formControl.disable();
    fixture.detectChanges();
    expect(getByRole('switch')).toHaveAttribute('data-disabled', '');
  });

  it('does not toggle while the form control is disabled', async () => {
    const formControl = new FormControl({ value: false, disabled: true });
    const { getByRole, fixture } = await render(
      `<app-switch [formControl]="formControl"></app-switch>`,
      {
        imports: [Switch, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const el = getByRole('switch');

    fireEvent.click(el);
    expect(formControl.value).toBe(false);
    expect(el).toHaveAttribute('aria-checked', 'false');

    // re-enabling the control restores interaction
    formControl.enable();
    fixture.detectChanges();

    fireEvent.click(el);
    expect(formControl.value).toBe(true);
    expect(el).toHaveAttribute('aria-checked', 'true');
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<app-switch [formControl]="formControl"></app-switch>`,
      {
        imports: [Switch, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('switch'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl(false);
    const { fixture } = await render(`<app-switch [formControl]="formControl"></app-switch>`, {
      imports: [Switch, ReactiveFormsModule],
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
