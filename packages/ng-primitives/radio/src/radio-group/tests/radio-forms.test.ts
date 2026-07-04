import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioItemFixture } from './radio-forms.fixture';

describe('RadioGroup (reusable component) — template-driven forms', () => {
  it('reflects the initial [(ngModel)] value', async () => {
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [(ngModel)]="value">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, FormsModule],
        componentProperties: { value: '2' },
      },
    );

    await fixture.whenStable();

    expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('data-checked', '');
    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked');
  });

  it('binds with [(ngModel)] two-way on selection', async () => {
    const ngModelChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const { getByRole, fixture, rerender } = await render(
        `
        <app-radio-group [(ngModel)]="value" (ngModelChange)="ngModelChange($event)">
          <app-radio-item value="1">One</app-radio-item>
          <app-radio-item value="2">Two</app-radio-item>
        </app-radio-group>
        `,
        {
          imports: [RadioGroup, RadioItemFixture, FormsModule],
          componentProperties: { value: null as string | null, ngModelChange },
        },
      );

      await fixture.whenStable();
      const one = getByRole('radio', { name: 'One' });
      expect(one).not.toHaveAttribute('data-checked');

      fireEvent.click(one);
      await fixture.whenStable();
      expect(one).toHaveAttribute('data-checked', '');
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(ngModelChange).toHaveBeenLastCalledWith('1');

      await rerender({ componentProperties: { value: '2', ngModelChange } });
      await fixture.whenStable();
      expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('data-checked', '');
      expect(one).not.toHaveAttribute('data-checked');
      // writing a new value from the model must not re-emit through onChange
      expect(ngModelChange).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('RadioGroup (reusable component) — reactive forms', () => {
  it('reflects the initial form control value', async () => {
    const formControl = new FormControl('1');
    const { getByRole } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('radio', { name: 'One' })).toHaveAttribute('data-checked', '');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
    expect(formControl.value).toBe('1');
  });

  it('updates the form control on click and the DOM on setValue', async () => {
    const formControl = new FormControl<string | null>(null);
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const one = getByRole('radio', { name: 'One' });

    fireEvent.click(one);
    expect(formControl.value).toBe('1');
    expect(one).toHaveAttribute('data-checked', '');

    formControl.setValue('2');
    fixture.detectChanges();
    expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('data-checked', '');
    expect(one).not.toHaveAttribute('data-checked');
  });

  it('reflects the disabled state from the form control', async () => {
    const formControl = new FormControl<string | null>(null);
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('radiogroup')).not.toHaveAttribute('data-disabled');

    formControl.disable();
    fixture.detectChanges();
    expect(getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
  });

  it('does not allow selection while the form control is disabled', async () => {
    const formControl = new FormControl<string | null>({ value: null, disabled: true });
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    await fixture.whenStable();
    const one = getByRole('radio', { name: 'One' });

    fireEvent.click(one);
    expect(formControl.value).toBeNull();
    expect(one).not.toHaveAttribute('data-checked');

    // re-enabling the control restores interaction
    formControl.enable();
    fixture.detectChanges();

    fireEvent.click(one);
    expect(formControl.value).toBe('1');
    expect(one).toHaveAttribute('data-checked', '');
  });

  it('marks the control as touched on focusout', async () => {
    const formControl = new FormControl<string | null>(null);
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(formControl.touched).toBe(false);

    fireEvent.focusOut(getByRole('radiogroup'));
    fixture.detectChanges();

    expect(formControl.touched).toBe(true);
  });

  it('clears the selection when the control is reset', async () => {
    const formControl = new FormControl<string | null>('1');
    const { getByRole, fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByRole('radio', { name: 'One' })).toHaveAttribute('data-checked', '');

    formControl.reset();
    fixture.detectChanges();

    expect(formControl.value).toBeNull();
    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string | null>(null);
    const { fixture } = await render(
      `
      <app-radio-group [formControl]="formControl">
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      {
        imports: [RadioGroup, RadioItemFixture, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue('1');
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('1');
  });
});
