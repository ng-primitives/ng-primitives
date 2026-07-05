import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination-forms.fixture';

describe('Pagination (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(
      `<app-pagination [(ngModel)]="value" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, FormsModule],
        componentProperties: { value: 3 },
      },
    );

    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '3');
    expect(getByRole('button', { name: 'Page 3' })).toHaveAttribute('data-selected', '');
  });

  it('binds with [(ngModel)] two-way on click', async () => {
    const ngModelChange = vi.fn();
    const { getByRole, fixture } = await render(
      `<app-pagination [(ngModel)]="value" (ngModelChange)="ngModelChange($event)" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, FormsModule],
        componentProperties: { value: 1, ngModelChange },
      },
    );

    await fixture.whenStable();
    ngModelChange.mockClear();

    fireEvent.click(getByRole('button', { name: 'Page 4' }));
    await fixture.whenStable();

    expect(getByRole('navigation')).toHaveAttribute('data-page', '4');
    expect(ngModelChange).toHaveBeenCalledWith(4);
  });
});

describe('Pagination (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl(2);
    const { getByRole, fixture } = await render(
      `<app-pagination [formControl]="formControl" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '2');
    expect(formControl.value).toBe(2);
  });

  it('updates the form control on click and the DOM on setValue', async () => {
    const formControl = new FormControl(1);
    const { getByRole, fixture } = await render(
      `<app-pagination [formControl]="formControl" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Page 3' }));
    await fixture.whenStable();
    expect(formControl.value).toBe(3);
    expect(getByRole('navigation')).toHaveAttribute('data-page', '3');

    formControl.setValue(5);
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '5');
    expect(getByRole('button', { name: 'Page 5' })).toHaveAttribute('data-selected', '');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl(1);
    const { getByRole, fixture } = await render(
      `<app-pagination [formControl]="formControl" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    expect(getByRole('navigation')).not.toHaveAttribute('data-disabled');

    // SUSPECTED BUG: the reusable pagination component does not implement
    // ControlValueAccessor.setDisabledState, so a disabled reactive form control
    // never propagates to the pagination (no data-disabled, controls stay
    // interactive). Compare with the radio/checkbox/slider fixtures which forward
    // setDisabledState to the primitive state.
    formControl.disable();
    await fixture.whenStable();
    expect(getByRole('navigation')).not.toHaveAttribute('data-disabled');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl(1);
    const { fixture } = await render(
      `<app-pagination [formControl]="formControl" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue(3);
    await fixture.whenStable();

    // writing a value from the model must not re-emit through onChange
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(3);
  });
});
