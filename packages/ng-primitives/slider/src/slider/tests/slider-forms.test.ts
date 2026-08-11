import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './slider-forms.fixture';

describe('Slider (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(
      `<app-slider [(ngModel)]="value" min="0" max="100"></app-slider>`,
      {
        imports: [Slider, FormsModule],
        componentProperties: { value: 60 },
      },
    );

    await fixture.whenStable();
    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '60');
  });

  it('binds with [(ngModel)] two-way on keyboard interaction', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture, rerender } = await render(
        `<app-slider [(ngModel)]="value" (ngModelChange)="ngModelChange($event)" min="0" max="100" step="5"></app-slider>`,
        {
          imports: [Slider, FormsModule],
          componentProperties: { value: 40, ngModelChange },
        },
      );

      await fixture.whenStable();
      const thumb = getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuenow', '40');

      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      await fixture.whenStable();
      expect(thumb).toHaveAttribute('aria-valuenow', '45');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith(45);

      // writing a new value from the model must not re-emit through onChange
      await rerender({ componentProperties: { value: 20, ngModelChange } });
      await fixture.whenStable();
      expect(thumb).toHaveAttribute('aria-valuenow', '20');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Slider (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl(30);
    const { getByRole } = await render(
      `<app-slider [formControl]="formControl" min="0" max="100"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
    expect(formControl.value).toBe(30);
  });

  it('updates the form control on keyboard and the DOM on setValue', async () => {
    const formControl = new FormControl(50);
    const { getByRole, fixture } = await render(
      `<app-slider [formControl]="formControl" min="0" max="100" step="10"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const thumb = getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(formControl.value).toBe(60);

    formControl.setValue(20);
    await fixture.whenStable();
    expect(thumb).toHaveAttribute('aria-valuenow', '20');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl(0);
    const { getByRole, fixture } = await render(
      `<app-slider [formControl]="formControl"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
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
    const formControl = new FormControl({ value: 40, disabled: true });
    const { getByRole, fixture } = await render(
      `<app-slider [formControl]="formControl" min="0" max="100" step="5"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const thumb = getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(formControl.value).toBe(40);
    expect(thumb).toHaveAttribute('aria-valuenow', '40');

    // re-enabling the control restores interaction
    formControl.enable();
    await fixture.whenStable();
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(formControl.value).toBe(45);
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl(0);
    const { getByRole, fixture } = await render(
      `<app-slider [formControl]="formControl"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('slider'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl(0);
    const { fixture } = await render(
      `<app-slider [formControl]="formControl" min="0" max="100"></app-slider>`,
      {
        imports: [Slider, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue(50);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(50);
  });
});
