import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpNumberPickerDecrement } from '../number-picker-decrement/number-picker-decrement';
import { NgpNumberPickerIncrement } from '../number-picker-increment/number-picker-increment';
import { NgpNumberPickerInput } from '../number-picker-input/number-picker-input';
import { NgpNumberPicker } from './number-picker';

describe('NgpNumberPicker', () => {
  it('should render the number picker component', async () => {
    await render(`<div ngpNumberPicker data-testid="number-picker"></div>`, {
      imports: [NgpNumberPicker],
    });

    const numberPicker = screen.getByTestId('number-picker');
    expect(numberPicker).toBeTruthy();
  });

  it('should accept a value input', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');
    expect(input).toHaveValue('5');
  });

  it('should increment the value when increment button is clicked', async () => {
    await render(
      `<div ngpNumberPicker>
        <button data-testid="increment-button" ngpNumberPickerIncrement>Increment</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
        <button data-testid="decrement-button" ngpNumberPickerDecrement>Decrement</button>
      </div>`,
      {
        imports: [
          NgpNumberPicker,
          NgpNumberPickerInput,
          NgpNumberPickerIncrement,
          NgpNumberPickerDecrement,
        ],
      },
    );

    const incrementButton = screen.getByTestId('increment-button');
    const input = screen.getByTestId('number-picker-input');

    fireEvent.click(incrementButton);
    expect(input).toHaveValue('0');
    fireEvent.click(incrementButton);
    expect(input).toHaveValue('1');
  });

  it('should decrement the value when decrement button is clicked', async () => {
    await render(
      `<div ngpNumberPicker>
        <button data-testid="increment-button" ngpNumberPickerIncrement>Increment</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
        <button data-testid="decrement-button" ngpNumberPickerDecrement>Decrement</button>
      </div>`,
      {
        imports: [
          NgpNumberPicker,
          NgpNumberPickerInput,
          NgpNumberPickerIncrement,
          NgpNumberPickerDecrement,
        ],
      },
    );

    const decrementButton = screen.getByTestId('decrement-button');
    const input = screen.getByTestId('number-picker-input');

    fireEvent.click(decrementButton);
    expect(input).toHaveValue('0');
    fireEvent.click(decrementButton);
    expect(input).toHaveValue('-1');
  });
});
