import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpNumberPickerInput } from './number-picker-input';

describe('NgpNumberPickerInput', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<input ngpNumberPickerInput />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = container.getByRole('textbox');
    expect(input).toBeTruthy();
  });

  it('should format the value correctly', async () => {
    await render(`<input ngpNumberPickerInput [value]="1234.56" />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('1,234.56');
  });

  it('should handle invalid input gracefully', async () => {
    await render(`<input ngpNumberPickerInput />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'invalid' } });
    expect(input).toHaveValue('');
  });

  it('should respect min and max attributes', async () => {
    await render(`<input ngpNumberPickerInput [min]="0" [max]="100" />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: '-10' } });
    expect(input).toHaveValue('0');

    fireEvent.input(input, { target: { value: '150' } });
    expect(input).toHaveValue('100');
  });

  it('should format the input value correctly', async () => {
    await render(
      `<input ngpNumberPickerInput [ngpNumberPickerValue]="1234.56" [ngpNumberPickerFormat]="{ style: 'currency', currency: 'USD' }" />`,
      {
        imports: [NgpNumberPickerInput],
      },
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('$1,234.56');
  });

  it('should allow only numeric input', async () => {
    await render(`<input ngpNumberPickerInput />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc123' } });
    expect(input).toHaveValue('123');
  });

  it('should move cursor to the end on focus', async () => {
    await render(`<input ngpNumberPickerInput value="12345" />`, {
      imports: [NgpNumberPickerInput],
    });

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.focus(input);
    expect(input.selectionStart).toBe(5);
    expect(input.selectionEnd).toBe(5);
  });
});
