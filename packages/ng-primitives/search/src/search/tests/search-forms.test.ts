import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { SearchFixture } from './search-forms.fixture';

describe('Search (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(`<app-search [(ngModel)]="value"></app-search>`, {
      imports: [SearchFixture, FormsModule],
      componentProperties: { value: 'hello' },
    });

    await fixture.whenStable();
    expect(getByRole('searchbox')).toHaveValue('hello');
  });

  it('binds with [(ngModel)] two-way on input', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture } = await render(
        `<app-search [(ngModel)]="value" (ngModelChange)="ngModelChange($event)"></app-search>`,
        {
          imports: [SearchFixture, FormsModule],
          componentProperties: { value: '', ngModelChange },
        },
      );

      await fixture.whenStable();
      const input = getByRole('searchbox') as HTMLInputElement;
      expect(input).toHaveValue('');

      input.value = 'world';
      fireEvent.input(input);
      await fixture.whenStable();

      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith('world');
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('Search (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl('hello');
    const { getByRole, fixture } = await render(
      `<app-search [formControl]="formControl"></app-search>`,
      {
        imports: [SearchFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(getByRole('searchbox')).toHaveValue('hello');
    expect(formControl.value).toBe('hello');
  });

  it('updates the form control as the user types', async () => {
    const formControl = new FormControl('');
    const { getByRole } = await render(`<app-search [formControl]="formControl"></app-search>`, {
      imports: [SearchFixture, ReactiveFormsModule],
      componentProperties: { formControl },
    });

    const input = getByRole('searchbox') as HTMLInputElement;
    input.value = 'world';
    fireEvent.input(input);

    expect(formControl.value).toBe('world');
  });

  it('writes a new value into the field on setValue', async () => {
    const formControl = new FormControl('');
    const { getByRole, fixture } = await render(
      `<app-search [formControl]="formControl"></app-search>`,
      {
        imports: [SearchFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    formControl.setValue('world');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getByRole('searchbox')).toHaveValue('world');
  });

  it('clears the field when the control is reset', async () => {
    const formControl = new FormControl('hello');
    const { getByRole, fixture } = await render(
      `<app-search [formControl]="formControl"></app-search>`,
      {
        imports: [SearchFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(getByRole('searchbox')).toHaveValue('hello');

    formControl.reset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(formControl.value).toBeNull();
    expect(getByRole('searchbox')).toHaveValue('');
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl('');
    const { getByRole, fixture } = await render(
      `<app-search [formControl]="formControl"></app-search>`,
      {
        imports: [SearchFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('searchbox'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl('');
    const { fixture } = await render(`<app-search [formControl]="formControl"></app-search>`, {
      imports: [SearchFixture, ReactiveFormsModule],
      componentProperties: { formControl },
    });

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue('world');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('world');
  });

  describe('disabled state', () => {
    it('disables the input when the control is disabled', async () => {
      const formControl = new FormControl('hello');
      const { getByRole, fixture } = await render(
        `<app-search [formControl]="formControl"></app-search>`,
        {
          imports: [SearchFixture, ReactiveFormsModule],
          componentProperties: { formControl },
        },
      );

      const input = getByRole('searchbox') as HTMLInputElement;
      expect(input.disabled).toBe(false);

      formControl.disable();
      fixture.detectChanges();
      await fixture.whenStable();

      // NgpInput picks the disabled state up from the surrounding form control.
      expect(input.disabled).toBe(true);
    });

    it('does not clear the field via the clear button while disabled', async () => {
      const formControl = new FormControl({ value: 'hello', disabled: true });
      const { getByRole } = await render(`<app-search [formControl]="formControl"></app-search>`, {
        imports: [SearchFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      });

      const input = getByRole('searchbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);

      // a disabled search must ignore clear requests
      fireEvent.click(getByRole('button', { name: 'Clear search' }));
      expect(input.value).toBe('hello');
    });
  });
});
