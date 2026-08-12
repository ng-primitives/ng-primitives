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

  it('falls back to the first page when the control is reset to null', async () => {
    // Angular writes null on reset (and before the initial value on init); the CVA must
    // not pass it through, or the data-page binding throws inside an afterRenderEffect -
    // which Angular swallows into a console error rather than failing anything.
    const formControl = new FormControl<number | null>(3);
    const { getByRole, fixture } = await render(
      `<app-pagination [formControl]="formControl" pageCount="5"></app-pagination>`,
      {
        imports: [Pagination, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '3');

    formControl.reset();
    await fixture.whenStable();

    expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
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
    const nextButton = getByRole('button', { name: 'Next Page' });
    expect(nextButton).toHaveAttribute('tabindex', '0');

    formControl.disable();
    await fixture.whenStable();

    // the disabled form control propagates to the pagination and its controls
    expect(getByRole('navigation')).toHaveAttribute('data-disabled', '');
    expect(nextButton).toHaveAttribute('tabindex', '-1');

    // re-enabling the control restores interaction
    formControl.enable();
    await fixture.whenStable();
    expect(getByRole('navigation')).not.toHaveAttribute('data-disabled');
    expect(getByRole('button', { name: 'Next Page' })).toHaveAttribute('tabindex', '0');
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
