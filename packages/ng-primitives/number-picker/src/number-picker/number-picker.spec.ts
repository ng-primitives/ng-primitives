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

  it('should not allow value below minimum', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerMin]="0" [ngpNumberPickerValue]="0">
        <button data-testid="decrement-button" ngpNumberPickerDecrement>Decrement</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerDecrement],
      },
    );

    const decrementButton = screen.getByTestId('decrement-button');
    const input = screen.getByTestId('number-picker-input');

    fireEvent.click(decrementButton);
    expect(input).toHaveValue('0');
  });

  it('should not allow value above maximum', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerMax]="10">
        <button data-testid="increment-button" ngpNumberPickerIncrement>Increment</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerIncrement],
      },
    );

    const incrementButton = screen.getByTestId('increment-button');
    const input = screen.getByTestId('number-picker-input');

    for (let i = 0; i < 11; i++) {
      fireEvent.click(incrementButton);
    }

    expect(input).toHaveValue('10');
  });

  it('should not increment beyond the max value', async () => {
    const { getByTestId } = await render(
      `<div ngpNumberPicker [ngpNumberPickerMax]="5">
        <button data-testid="increment-button" ngpNumberPickerIncrement>Increment</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerIncrement],
      },
    );

    const incrementButton = getByTestId('increment-button');
    const input = getByTestId('number-picker-input') as HTMLInputElement;

    for (let i = 0; i < 6; i++) {
      fireEvent.click(incrementButton);
    }

    expect(input.value).toBe('5');
  });

  it('should not exceed the maximum value', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5" [ngpNumberPickerMax]="5">
        <button data-testid="increment-button" ngpNumberPickerIncrement>Increment</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerIncrement],
      },
    );

    const incrementButton = screen.getByTestId('increment-button');
    const input = screen.getByTestId('number-picker-input');

    fireEvent.click(incrementButton);
    expect(input).toHaveValue('5');
  });

  it('should not go below the minimum value', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="0" [ngpNumberPickerMin]="0">
        <button data-testid="decrement-button" ngpNumberPickerDecrement>Decrement</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerDecrement],
      },
    );

    const decrementButton = screen.getByTestId('decrement-button');
    const input = screen.getByTestId('number-picker-input');

    fireEvent.click(decrementButton);
    expect(input).toHaveValue('0');
  });

  it('should not decrement below the min value', async () => {
    const { getByTestId } = await render(
      `<div ngpNumberPicker [ngpNumberPickerMin]="-5">
        <button data-testid="decrement-button" ngpNumberPickerDecrement>Decrement</button>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput, NgpNumberPickerDecrement],
      },
    );

    const decrementButton = getByTestId('decrement-button');
    const input = getByTestId('number-picker-input') as HTMLInputElement;

    for (let i = 0; i < 6; i++) {
      fireEvent.click(decrementButton);
    }

    expect(input.value).toBe('-5');
  });

  it('should increment and decrement using arrow keys', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="0">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('1');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('0');
  });

  it('should increment the value when the up arrow key is pressed', async () => {
    const { getByTestId } = await render(
      `<div ngpNumberPicker>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = getByTestId('number-picker-input') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('0');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('1');
  });

  it('should decrement the value when the down arrow key is pressed', async () => {
    const { getByTestId } = await render(
      `<div ngpNumberPicker>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = getByTestId('number-picker-input') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('0');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('-1');
  });

  it('should handle non-numeric input gracefully', async () => {
    await render(
      `<div ngpNumberPicker>
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue('');
  });

  it('should increment and decrement value using keyboard events', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5" [ngpNumberPickerStep]="2">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('7');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('5');
  });

  it('should not exceed min and max boundaries', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5" [ngpNumberPickerMin]="0" [ngpNumberPickerMax]="10">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('10');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('0');
  });

  it('should respect the step value', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="0" [ngpNumberPickerStep]="3">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('3');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('0');
  });

  it('should not allow changes when readonly', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5" [ngpNumberPickerReadonly]="true">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('5');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('5');
  });

  it('should not allow changes when disabled', async () => {
    await render(
      `<div ngpNumberPicker [ngpNumberPickerValue]="5" [ngpNumberPickerDisabled]="true">
        <input data-testid="number-picker-input" ngpNumberPickerInput />
      </div>`,
      {
        imports: [NgpNumberPicker, NgpNumberPickerInput],
      },
    );

    const input = screen.getByTestId('number-picker-input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('5');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('5');
  });
});
