import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Rating } from './rating-forms.fixture';

describe('Rating (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(
      `<app-rating [(ngModel)]="value" count="5"></app-rating>`,
      {
        imports: [Rating, FormsModule],
        componentProperties: { value: 3 },
      },
    );

    await fixture.whenStable();
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
  });

  it('binds with [(ngModel)] two-way on keyboard interaction', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture, rerender } = await render(
        `<app-rating [(ngModel)]="value" (ngModelChange)="ngModelChange($event)" count="5"></app-rating>`,
        {
          imports: [Rating, FormsModule],
          componentProperties: { value: 2, ngModelChange },
        },
      );

      await fixture.whenStable();
      const rating = getByRole('slider');
      expect(rating).toHaveAttribute('aria-valuenow', '2');

      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      await fixture.whenStable();
      expect(rating).toHaveAttribute('aria-valuenow', '3');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith(3);

      // writing a new value from the model must not re-emit through onChange
      await rerender({ componentProperties: { value: 1, ngModelChange } });
      await fixture.whenStable();
      expect(rating).toHaveAttribute('aria-valuenow', '1');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Rating (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl(3);
    const { getByRole } = await render(
      `<app-rating [formControl]="formControl" count="5"></app-rating>`,
      {
        imports: [Rating, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '3');
    expect(formControl.value).toBe(3);
  });

  it('updates the form control on keyboard and the DOM on setValue', async () => {
    const formControl = new FormControl(2);
    const { getByRole, fixture } = await render(
      `<app-rating [formControl]="formControl" count="5"></app-rating>`,
      {
        imports: [Rating, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const rating = getByRole('slider');

    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    expect(formControl.value).toBe(3);

    formControl.setValue(1);
    await fixture.whenStable();
    expect(rating).toHaveAttribute('aria-valuenow', '1');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl(0);
    const { getByRole, fixture } = await render(
      `<app-rating [formControl]="formControl" count="5"></app-rating>`,
      {
        imports: [Rating, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('slider')).not.toHaveAttribute('data-disabled');

    formControl.disable();
    await fixture.whenStable();
    expect(getByRole('slider')).toHaveAttribute('data-disabled', '');
    expect(getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });

  it('does not change value with the keyboard while disabled', async () => {
    const formControl = new FormControl({ value: 2, disabled: true });
    const { getByRole, fixture } = await render(
      `<app-rating [formControl]="formControl" count="5"></app-rating>`,
      {
        imports: [Rating, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const rating = getByRole('slider');

    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(formControl.value).toBe(2);
    expect(rating).toHaveAttribute('aria-valuenow', '2');

    // re-enabling the control restores interaction
    formControl.enable();
    await fixture.whenStable();
    fireEvent.keyDown(rating, { key: 'ArrowRight' });
    expect(formControl.value).toBe(3);
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl(0);
    const { getByRole, fixture } = await render(
      `<app-rating [formControl]="formControl" count="5"></app-rating>`,
      {
        imports: [Rating, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('slider'));
    expect(formControl.touched).toBe(true);
  });
});
