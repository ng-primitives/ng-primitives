import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './toggle-forms.fixture';

describe('Toggle (reusable component) — template-driven forms', () => {
  it('binds with [(ngModel)] two-way', async () => {
    const ngModelChange = vi.fn();
    const { getByRole, fixture, rerender } = await render(
      `<button app-toggle [(ngModel)]="value" (ngModelChange)="ngModelChange($event)">Toggle</button>`,
      {
        imports: [Toggle, FormsModule],
        componentProperties: { value: false, ngModelChange },
      },
    );
    const button = getByRole('button');

    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(ngModelChange).toHaveBeenCalledTimes(1);
    expect(ngModelChange).toHaveBeenLastCalledWith(true);

    await rerender({ componentProperties: { value: false, ngModelChange } });
    await fixture.whenStable();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(ngModelChange).toHaveBeenCalledTimes(1);
  });

  it('respects [disabled] in template-driven forms', async () => {
    const { getByRole } = await render(
      `<button app-toggle [(ngModel)]="value" [disabled]="true">Toggle</button>`,
      {
        imports: [Toggle, FormsModule],
        componentProperties: { value: false },
      },
    );
    const button = getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Toggle (reusable component) — reactive forms', () => {
  it('reflects initial form control value', async () => {
    const formControl = new FormControl(true);
    const { getByRole } = await render(
      `<button app-toggle [formControl]="formControl">Toggle</button>`,
      {
        imports: [Toggle, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected', '');
    expect(formControl.value).toBe(true);
  });

  it('updates form control on click and DOM on setValue', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<button app-toggle [formControl]="formControl">Toggle</button>`,
      {
        imports: [Toggle, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    const button = getByRole('button');

    fireEvent.click(button);
    expect(formControl.value).toBe(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    formControl.setValue(false);
    fixture.detectChanges();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects disabled state from form control', async () => {
    const formControl = new FormControl(false);
    const { getByRole, fixture } = await render(
      `<button app-toggle [formControl]="formControl">Toggle</button>`,
      {
        imports: [Toggle, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    const button = getByRole('button');
    formControl.disable();
    fixture.detectChanges();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl(false);
    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    const { fixture } = await render(
      `<button app-toggle [formControl]="formControl">Toggle</button>`,
      {
        imports: [Toggle, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(spy).not.toHaveBeenCalled();

    formControl.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
