import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from './input';

describe('NgpInput', () => {
  it('should add the data-hover attribute on hover', async () => {
    const { getByRole } = await render(`<input ngpInput />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    fireEvent.mouseEnter(input);
    expect(input).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('should add the data-pressed attribute on press', async () => {
    const { getByRole } = await render(`<input ngpInput />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute('data-press');
    fireEvent.pointerUp(input);
    expect(input).not.toHaveAttribute('data-press');
  });

  it('should add data attributes for form control status when ngModel is used', async () => {
    const { getByRole } = await render(`<input ngpInput [(ngModel)]="value" />`, {
      imports: [NgpInput, FormsModule],
      componentProperties: { value: '' },
    });

    const input = getByRole('textbox');
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
    const user = userEvent.setup();
    const { getByRole } = await render(`<input ngpInput disabled="true" />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    fireEvent.focus(input);
    await user.type(input, 'Hello World');
    expect(input).toHaveValue('');
  });

  it('should allow typing text into the input', async () => {
    const user = userEvent.setup();
    const { getByRole } = await render(`<input ngpInput />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should support typing with the spacebar key', async () => {
    const user = userEvent.setup();
    const { getByRole } = await render(`<input ngpInput />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Hello');
    await user.keyboard(' ');
    await user.type(input, 'Angular');
    await user.keyboard('  ');
    await user.type(input, 'Primitives');

    expect(input).toHaveValue('Hello Angular  Primitives');
  });

  it('should set the id attribute', async () => {
    const { getByRole } = await render(`<input ngpInput />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('id');
    expect(input.id).toMatch(/^ngp-input-\d+$/);
  });

  it('should allow the user to set a custom id', async () => {
    const customId = 'custom-input-id';
    const { getByRole } = await render(`<input ngpInput id="custom-input-id" />`, {
      imports: [NgpInput],
    });

    expect(getByRole('textbox')).toHaveAttribute('id', customId);
  });

  it('should add the disabled attribute when disabled is true', async () => {
    const { getByRole } = await render(`<input ngpInput disabled />`, {
      imports: [NgpInput],
    });

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('disabled');
    expect(input).toBeDisabled();
  });

  it('should connect the label with the input', async () => {
    const { getByText, getByRole } = await render(
      `<div ngpFormField>
        <label ngpLabel id="label-id">Custom Label</label>
        <input ngpInput id="custom-id" />
      </div>`,
      {
        imports: [NgpInput, NgpFormField, NgpLabel],
      },
    );

    const input = getByRole('textbox', { name: 'Custom Label' });
    const label = getByText('Custom Label');
    expect(label).toHaveAttribute('for', 'custom-id');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).toHaveAttribute('aria-labelledby', 'label-id');
  });

  it('should add the disabled attribute when the form control is disabled via ReactiveForms', async () => {
    const { getByRole, detectChanges } = await render(
      `<input ngpInput [formControl]="control" />`,
      {
        imports: [NgpInput, ReactiveFormsModule],
        componentProperties: {
          control: new FormControl({ value: '', disabled: true }),
        },
      },
    );

    detectChanges();

    const input = getByRole('textbox');
    expect(input).toHaveAttribute('disabled');
    expect(input).toBeDisabled();
  });
});
