import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { describe, expect, it } from 'vitest';
import { CheckboxGroupFixture } from './checkbox-group-forms.fixture';

describe('CheckboxGroup (reusable component) — reactive forms', () => {
  it('reflects and updates a form control array', async () => {
    const formControl = new FormControl<string[]>(['one']);
    const { getByTestId, fixture } = await render(
      `<app-checkbox-group [formControl]="formControl">
        <div ngpCheckbox ngpCheckboxValue="one" data-testid="one"></div>
        <div ngpCheckbox ngpCheckboxValue="two" data-testid="two"></div>
      </app-checkbox-group>`,
      {
        imports: [CheckboxGroupFixture, NgpCheckbox, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByTestId('one')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(getByTestId('two'));
    expect(formControl.value).toEqual(['one', 'two']);

    formControl.setValue([]);
    fixture.detectChanges();
    expect(getByTestId('one')).toHaveAttribute('aria-checked', 'false');
  });
});
