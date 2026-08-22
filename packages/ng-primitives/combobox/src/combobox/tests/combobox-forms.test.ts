import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComboboxFixture } from './combobox-forms.fixture';

const options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

afterEach(() => {
  const dropdown = screen.queryByRole('listbox');
  if (dropdown) {
    dropdown.remove();
  }
});

describe('Combobox (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { fixture } = await render(
      `<app-combobox [options]="options" [(ngModel)]="value"></app-combobox>`,
      {
        imports: [ComboboxFixture, FormsModule],
        componentProperties: { options, value: 'Banana' },
      },
    );

    await fixture.whenStable();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Banana');
  });

  it('binds with [(ngModel)] two-way on selection', async () => {
    const ngModelChange = vi.fn();
    const { fixture, rerender } = await render(
      `<app-combobox [options]="options" [(ngModel)]="value" (ngModelChange)="ngModelChange($event)"></app-combobox>`,
      {
        imports: [ComboboxFixture, FormsModule],
        componentProperties: { options, value: undefined, ngModelChange },
      },
    );

    await fixture.whenStable();

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(screen.getByText('Apple'));

    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Apple');
    expect(ngModelChange).toHaveBeenCalledWith('Apple');

    ngModelChange.mockClear();

    // writing a new value from the model must not re-emit through onChange
    await rerender({ componentProperties: { options, value: 'Cherry', ngModelChange } });
    await fixture.whenStable();

    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Cherry');
    expect(ngModelChange).not.toHaveBeenCalled();
  });
});

describe('Combobox (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl('Cherry');
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await fixture.whenStable();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Cherry');
    expect(formControl.value).toBe('Cherry');
  });

  it('updates the form control on selection and the DOM on setValue', async () => {
    const formControl = new FormControl<string | undefined>(undefined);
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(screen.getByText('Banana'));

    expect(formControl.value).toBe('Banana');

    formControl.setValue('Dragon Fruit');
    fixture.detectChanges();
    await fixture.whenStable();

    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Dragon Fruit');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl('Apple');
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await fixture.whenStable();
    const combobox = screen.getByTestId('combobox');
    expect(combobox).not.toHaveAttribute('data-disabled');
    expect(screen.getByRole('combobox')).not.toBeDisabled();

    formControl.disable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(combobox).toHaveAttribute('data-disabled', '');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('marks the control as touched on blur', async () => {
    const formControl = new FormControl('Apple');
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.blur(screen.getByTestId('combobox-input'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('clears the value when the control is reset', async () => {
    const formControl = new FormControl('Apple');
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await fixture.whenStable();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Apple');

    formControl.reset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(formControl.value).toBeNull();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  });

  it('clears the form control when the input is emptied then closed', async () => {
    const formControl = new FormControl<string | undefined>('Apple');
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await fixture.whenStable();
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Apple');

    // open the dropdown, clear the input text, then close by clicking outside
    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.clear(input);
    await userEvent.click(document.body);
    await fixture.whenStable();

    // the input reflects the cleared value, and the form control is reset to match
    expect(input.value).toBe('');
    expect(formControl.value).toBeFalsy();
  });

  it('does not mark the control dirty when opened and closed without a change', async () => {
    const formControl = new FormControl<string | null>(null);
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );
    await fixture.whenStable();

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(document.body);
    await fixture.whenStable();

    expect(spy).not.toHaveBeenCalled();
    expect(formControl.dirty).toBe(false);
    expect(formControl.value).toBeNull();
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string | undefined>(undefined);
    const { fixture } = await render(
      `<app-combobox [options]="options" [formControl]="formControl"></app-combobox>`,
      {
        imports: [ComboboxFixture, ReactiveFormsModule],
        componentProperties: { options, formControl },
      },
    );

    await fixture.whenStable();

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue('Banana');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('Banana');

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
