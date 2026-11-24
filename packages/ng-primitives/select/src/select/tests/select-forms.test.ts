import { Component } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';
import { provideValueAccessor } from 'ng-primitives/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectFixture } from './select-forms.fixture';

/**
 * A wrapper whose value accessor leaves `setDisabledState` out, so the form control's status is
 * the only thing telling the select it is disabled.
 */
@Component({
  selector: 'app-select-without-set-disabled-state',
  hostDirectives: [NgpSelect],
  providers: [provideValueAccessor(SelectWithoutSetDisabledState)],
  imports: [NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  template: `
    <div *ngpSelectPortal ngpSelectDropdown>
      <div ngpSelectOptionValue="Apple" ngpSelectOption data-testid="option-Apple">Apple</div>
    </div>
  `,
  host: { 'data-testid': 'select' },
})
class SelectWithoutSetDisabledState implements ControlValueAccessor {
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

function removeLingeringDropdown(): void {
  // Dropdown is portalled to the body, so fixture.destroy() alone can leave
  // it lingering between tests.
  const dropdown = screen.queryByRole('listbox');
  if (dropdown) {
    dropdown.remove();
  }
}

describe('Select (reusable component) — template-driven forms', () => {
  afterEach(removeLingeringDropdown);

  it('binds with [(ngModel)] two-way', async () => {
    const ngModelChange = vi.fn();
    const user = userEvent.setup();
    const { fixture, rerender } = await render(
      `<app-select
         [options]="options"
         [(ngModel)]="value"
         (ngModelChange)="ngModelChange($event)"
       />`,
      {
        imports: [SelectFixture, FormsModule],
        componentProperties: {
          options: ['Apple', 'Banana'],
          value: undefined as string | undefined,
          ngModelChange,
        },
      },
    );

    await fixture.whenStable();
    expect(screen.getByTestId('select-placeholder')).toBeInTheDocument();

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));
    await fixture.whenStable();

    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');
    expect(ngModelChange).toHaveBeenCalledTimes(1);
    expect(ngModelChange).toHaveBeenLastCalledWith('Apple');

    // External rerender clears the model — the select should reflect it.
    await rerender({
      componentProperties: {
        options: ['Apple', 'Banana'],
        value: undefined,
        ngModelChange,
      },
    });
    await fixture.whenStable();
    expect(screen.getByTestId('select-placeholder')).toBeInTheDocument();
    expect(ngModelChange).toHaveBeenCalledTimes(1);
  });
});

describe('Select (reusable component) — reactive forms', () => {
  afterEach(removeLingeringDropdown);

  it('reflects initial form control value', async () => {
    const formControl = new FormControl<string | undefined>('Apple');
    await render(`<app-select [options]="options" [formControl]="formControl" />`, {
      imports: [SelectFixture, ReactiveFormsModule],
      componentProperties: { options: ['Apple', 'Banana'], formControl },
    });

    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');
    expect(formControl.value).toBe('Apple');
  });

  it('updates form control on user selection and DOM on setValue', async () => {
    const user = userEvent.setup();
    const formControl = new FormControl<string | undefined>(undefined);
    const { fixture } = await render(
      `<app-select [options]="options" [formControl]="formControl" />`,
      {
        imports: [SelectFixture, ReactiveFormsModule],
        componentProperties: { options: ['Apple', 'Banana'], formControl },
      },
    );

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Banana'));
    expect(formControl.value).toBe('Banana');
    expect(screen.getByTestId('select-value')).toHaveTextContent('Banana');

    formControl.setValue('Apple');
    fixture.detectChanges();
    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');

    formControl.setValue(undefined);
    fixture.detectChanges();
    expect(screen.getByTestId('select-placeholder')).toBeInTheDocument();
  });

  it('reflects disabled state from the form control', async () => {
    const formControl = new FormControl<string | undefined>(undefined);
    const { fixture } = await render(
      `<app-select [options]="options" [formControl]="formControl" />`,
      {
        imports: [SelectFixture, ReactiveFormsModule],
        componentProperties: { options: ['Apple', 'Banana'], formControl },
      },
    );

    expect(screen.getByTestId('select')).not.toHaveAttribute('data-disabled');
    expect(screen.getByTestId('select')).toHaveAttribute('aria-disabled', 'false');

    formControl.disable();
    fixture.detectChanges();
    expect(screen.getByTestId('select')).toHaveAttribute('data-disabled');
    expect(screen.getByTestId('select')).toHaveAttribute('aria-disabled', 'true');

    formControl.enable();
    fixture.detectChanges();
    expect(screen.getByTestId('select')).not.toHaveAttribute('data-disabled');
    expect(screen.getByTestId('select')).toHaveAttribute('aria-disabled', 'false');
  });

  it('treats a select disabled only through its form control status as disabled', async () => {
    const user = userEvent.setup();
    const formControl = new FormControl<string | undefined>({ value: undefined, disabled: true });
    const { fixture } = await render(
      `<app-select-without-set-disabled-state [formControl]="formControl" />`,
      {
        imports: [SelectWithoutSetDisabledState, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const select = screen.getByTestId('select');
    await waitFor(() => expect(select).toHaveAttribute('data-disabled'));
    expect(select).toHaveAttribute('aria-disabled', 'true');
    expect(select).toHaveAttribute('tabindex', '-1');

    await user.click(select);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    formControl.enable();
    fixture.detectChanges();
    expect(select).toHaveAttribute('aria-disabled', 'false');
    expect(select).toHaveAttribute('tabindex', '0');

    await user.click(select);
    const option = await screen.findByTestId('option-Apple');
    expect(option).toHaveAttribute('aria-disabled', 'false');

    formControl.disable();
    fixture.detectChanges();
    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveAttribute('data-disabled');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string | undefined>(undefined);
    const { fixture } = await render(
      `<app-select [options]="options" [formControl]="formControl" />`,
      {
        imports: [SelectFixture, ReactiveFormsModule],
        componentProperties: { options: ['Apple', 'Banana'], formControl },
      },
    );

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue('Apple');
    fixture.detectChanges();

    // valueChanges fires exactly once (from the explicit setValue), not twice
    // (which would indicate a writeValue → onChange → setValue loop).
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('Apple');
  });

  it('supports multiple selection bound to a FormControl<string[]>', async () => {
    const user = userEvent.setup();
    const formControl = new FormControl<string[]>([]);
    await render(
      `<app-select
         [options]="options"
         [multiple]="true"
         [formControl]="formControl"
       />`,
      {
        imports: [SelectFixture, ReactiveFormsModule],
        componentProperties: { options: ['Apple', 'Banana', 'Cherry'], formControl },
      },
    );

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));
    await user.click(screen.getByTestId('option-Cherry'));

    expect(formControl.value).toEqual(['Apple', 'Cherry']);
    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple, Cherry');
  });

  it('marks the control as touched on blur', async () => {
    const user = userEvent.setup();
    const formControl = new FormControl<string | undefined>(undefined);
    await render(`<app-select [options]="options" [formControl]="formControl" />`, {
      imports: [SelectFixture, ReactiveFormsModule],
      componentProperties: { options: ['Apple', 'Banana'], formControl },
    });

    expect(formControl.touched).toBe(false);

    await user.click(screen.getByTestId('select'));
    await user.click(document.body);

    expect(formControl.touched).toBe(true);
  });
});
