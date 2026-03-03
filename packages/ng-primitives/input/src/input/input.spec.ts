import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from './input';

describe('NgpInput', () => {
  it('should add the data-hover attribute on hover', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    fireEvent.mouseEnter(input);
    expect(input).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('should add the data-pressed attribute on press', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });
    const input = getByTestId('input');
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute('data-press');
    fireEvent.pointerUp(input);
    expect(input).not.toHaveAttribute('data-press');
  });

  it('should add data attributes for form control status when ngModel is used', async () => {
    const { getByTestId } = await render(
      `<input ngpInput data-testid="input" [(ngModel)]="value" />`,
      {
        imports: [NgpInput, FormsModule],
        componentProperties: { value: '' },
      },
    );

    const input = getByTestId('input');
    expect(input).toHaveAttribute('data-valid');
    expect(input).not.toHaveAttribute('data-invalid');
    expect(input).toHaveAttribute('data-pristine');
    expect(input).not.toHaveAttribute('data-dirty');
    expect(input).not.toHaveAttribute('data-touched');

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).not.toHaveAttribute('data-pristine');
    expect(input).toHaveAttribute('data-dirty');
  });

  it('should not allow text entering when disabled', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" disabled="true" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    fireEvent.focus(input);
    await userEvent.type(input, 'Hello World');
    expect(input).toHaveValue('');
  });

  it('should allow typing text into the input', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    await userEvent.click(input);
    await userEvent.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should support typing with the spacebar key', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    await userEvent.click(input);
    await userEvent.type(input, 'Hello');
    await userEvent.keyboard(' ');
    await userEvent.type(input, 'Angular');
    await userEvent.keyboard('  ');
    await userEvent.type(input, 'Primitives');

    expect(input).toHaveValue('Hello Angular  Primitives');
  });

  it('should set the id attribute', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    expect(input).toHaveAttribute('id');
    expect(input.id).toMatch(/^ngp-input-\d+$/);
  });

  it('should allow th user to set a custom id', async () => {
    const customId = 'custom-input-id';
    const { getByTestId } = await render(
      `<input ngpInput id="${customId}" data-testid="input" />`,
      {
        imports: [NgpInput],
      },
    );

    const input = getByTestId('input');
    expect(input).toHaveAttribute('id', customId);
  });

  it('should add the disabled attribute when disabled is true', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" disabled />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    expect(input).toHaveAttribute('disabled');
    expect(input).toBeDisabled();
  });

  it('should connect the label with the input', async () => {
    const { getByTestId } = await render(
      `<div ngpFormField>
        <label ngpLabel id="label-id" data-testid="label">Custom Label</label>
        <input ngpInput data-testid="input" id="custom-id" />
      </div>`,
      {
        imports: [NgpInput, NgpFormField, NgpLabel],
      },
    );

    const input = getByTestId('input');
    const label = getByTestId('label');
    expect(label).toHaveAttribute('for', 'custom-id');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).toHaveAttribute('aria-labelledby', 'label-id');
  });

  it('should add the disabled attribute when the form control is disabled via ReactiveForms', async () => {
    const { getByTestId, detectChanges } = await render(
      `<input ngpInput data-testid="input" [formControl]="control" />`,
      {
        imports: [NgpInput, ReactiveFormsModule],
        componentProperties: {
          control: new FormControl({ value: '', disabled: true }),
        },
      },
    );

    detectChanges();

    const input = getByTestId('input');
    expect(input).toHaveAttribute('disabled');
    expect(input).toBeDisabled();
  });
});
