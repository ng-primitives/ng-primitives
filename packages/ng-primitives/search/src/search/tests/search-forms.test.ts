import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch } from 'ng-primitives/search';
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

  describe('data-empty', () => {
    it('is absent when the control starts with a value', async () => {
      const formControl = new FormControl('hello');
      const { container, fixture } = await render(
        `<app-search [formControl]="formControl"></app-search>`,
        { imports: [SearchFixture, ReactiveFormsModule], componentProperties: { formControl } },
      );
      await fixture.whenStable();

      expect(container.querySelector('app-search')).not.toHaveAttribute('data-empty');
    });

    it('follows setValue and reset', async () => {
      const formControl = new FormControl('');
      const { container, fixture } = await render(
        `<app-search [formControl]="formControl"></app-search>`,
        { imports: [SearchFixture, ReactiveFormsModule], componentProperties: { formControl } },
      );
      const host = container.querySelector('app-search');

      formControl.setValue('world');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host).not.toHaveAttribute('data-empty');

      formControl.reset();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host).toHaveAttribute('data-empty', '');
    });

    it('follows a form control bound directly to the input', async () => {
      const formControl = new FormControl('hello');
      const { getByTestId, fixture } = await render(
        `<div data-testid="search" ngpSearch>
          <input [formControl]="formControl" ngpInput type="search" />
        </div>`,
        {
          imports: [NgpSearch, NgpInput, ReactiveFormsModule],
          componentProperties: { formControl },
        },
      );
      await fixture.whenStable();
      expect(getByTestId('search')).not.toHaveAttribute('data-empty');

      formControl.setValue('');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getByTestId('search')).toHaveAttribute('data-empty', '');
    });
  });

  it('keeps a pristine control pristine when Escape is pressed on an empty field', async () => {
    const formControl = new FormControl('');
    const { getByRole } = await render(
      `<div ngpSearch><input [formControl]="formControl" ngpInput type="search" /></div>`,
      {
        imports: [NgpSearch, NgpInput, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    fireEvent.keyDown(getByRole('searchbox'), { key: 'Escape' });

    expect(formControl.pristine).toBe(true);
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

    it('disables the clear button while the control is disabled', async () => {
      const formControl = new FormControl({ value: 'hello', disabled: true });
      const { getByRole, fixture } = await render(
        `<app-search [formControl]="formControl"></app-search>`,
        { imports: [SearchFixture, ReactiveFormsModule], componentProperties: { formControl } },
      );
      await fixture.whenStable();
      const button = getByRole('button', { name: 'Clear search' });

      // the fixture also applies ngpButton, which binds the same attributes
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-disabled', '');

      formControl.enable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveAttribute('data-disabled');

      formControl.disable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('data-disabled', '');
    });
  });
});
