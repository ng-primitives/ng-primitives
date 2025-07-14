import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { NgpFormControl } from './form-control';

describe('NgpFormControl', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpFormControl></div>`, {
      imports: [NgpFormControl],
    });
  });

  it('should apply disabled attribute when disabled is true', async () => {
    const { getByTestId } = await render(
      `<div ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></div>`,
      {
        imports: [NgpFormControl],
      },
    );

    const control = getByTestId('control');
    expect(control).toHaveAttribute('disabled');
  });

  it('should not apply disabled attribute when disabled is false', async () => {
    const { getByTestId } = await render(
      `<div ngpFormControl data-testid="control" [ngpFormControlDisabled]="false"></div>`,
      {
        imports: [NgpFormControl],
      },
    );

    const control = getByTestId('control');
    expect(control).not.toHaveAttribute('disabled');
  });

  it('should not apply disabled attribute by default', async () => {
    const { getByTestId } = await render(`<div ngpFormControl data-testid="control"></div>`, {
      imports: [NgpFormControl],
    });

    const control = getByTestId('control');
    expect(control).not.toHaveAttribute('disabled');
  });

  it('should apply disabled attribute when form control is disabled', async () => {
    const { getByTestId, detectChanges } = await render(
      `<input ngpFormControl data-testid="control" [formControl]="control" />`,
      {
        imports: [NgpFormControl, ReactiveFormsModule],
        componentProperties: {
          control: new FormControl({ value: '', disabled: true }),
        },
      },
    );

    detectChanges();

    const control = getByTestId('control');
    expect(control).toHaveAttribute('disabled');
  });

  it('should combine disabled state from input and form control', async () => {
    const { getByTestId, detectChanges } = await render(
      `<input ngpFormControl data-testid="control" [formControl]="control" [ngpFormControlDisabled]="true" />`,
      {
        imports: [NgpFormControl, ReactiveFormsModule],
        componentProperties: {
          control: new FormControl({ value: '', disabled: false }),
        },
      },
    );

    detectChanges();

    const control = getByTestId('control');
    expect(control).toHaveAttribute('disabled');
  });
});
