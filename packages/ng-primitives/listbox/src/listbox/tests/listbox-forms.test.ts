import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Listbox, ListboxOption } from './listbox-forms.fixture';

/**
 * These suites exercise the reusable `Listbox` ControlValueAccessor fixture,
 * which mirrors `apps/components/.../reusable-components/listbox/listbox.ts`.
 */

describe('Listbox (reusable component) — template-driven forms', () => {
  it('renders with [(ngModel)] and reflects the initial value', async () => {
    const { getByRole, fixture } = await render(
      `
      <app-listbox [(ngModel)]="value" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, FormsModule],
        componentProperties: { value: ['banana'] as string[] },
      },
    );
    await fixture.whenStable();

    expect(getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected', '');
    expect(getByRole('option', { name: 'Apple' })).not.toHaveAttribute('data-selected');
  });
});

describe('Listbox (reusable component) — reactive forms', () => {
  it('updates the form control on click', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const apple = getByRole('option', { name: 'Apple' });

    fireEvent.click(apple);
    expect(formControl.value).toEqual(['apple']);
    expect(apple).toHaveAttribute('data-selected', '');
  });

  it('accumulates the form control value on click in multiple mode', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" mode="multiple" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    fireEvent.click(getByRole('option', { name: 'Apple' }));
    fireEvent.click(getByRole('option', { name: 'Banana' }));

    expect(formControl.value).toEqual(['apple', 'banana']);
  });

  it('reflects the initial form control value', async () => {
    const formControl = new FormControl<string[]>(['apple']);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();

    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('data-selected', '');
    expect(formControl.value).toEqual(['apple']);
  });

  it('reflects the DOM when the form control value is set', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();

    formControl.setValue(['banana']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getByRole('option', { name: 'Banana' })).toHaveAttribute('data-selected', '');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'false');

    formControl.disable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not allow selection while the form control is disabled', async () => {
    const formControl = new FormControl<string[]>({ value: [], disabled: true });
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const apple = getByRole('option', { name: 'Apple' });

    fireEvent.click(apple);
    expect(formControl.value).toEqual([]);
    expect(apple).not.toHaveAttribute('data-selected');

    // re-enabling the control restores interaction
    formControl.enable();
    fixture.detectChanges();
    await fixture.whenStable();

    fireEvent.click(apple);
    expect(formControl.value).toEqual(['apple']);
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('listbox'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string[]>([]);
    const { fixture } = await render(
      `
      <app-listbox [formControl]="formControl" aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      {
        imports: [Listbox, ListboxOption, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue(['apple']);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(['apple']);
  });
});
