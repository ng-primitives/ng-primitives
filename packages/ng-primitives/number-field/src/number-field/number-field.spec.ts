import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpNumberFieldDecrement } from '../number-field-decrement/number-field-decrement';
import { NgpNumberFieldGroup } from '../number-field-group/number-field-group';
import { NgpNumberFieldIncrement } from '../number-field-increment/number-field-increment';
import { NgpNumberFieldInput } from '../number-field-input/number-field-input';
import { NgpNumberFieldLabel } from '../number-field-label/number-field-label';
import { NgpNumberField } from './number-field';

describe('NgpNumberField', () => {
  const imports = [
    NgpNumberField,
    NgpNumberFieldInput,
    NgpNumberFieldIncrement,
    NgpNumberFieldDecrement,
    NgpNumberFieldLabel,
    NgpNumberFieldGroup,
  ];

  function createTemplate(extraProps = ''): string {
    return `
      <div
        ngpNumberField
        data-testid="number-field"
        (ngpNumberFieldValueChange)="valueChange($event)"
        ${extraProps}>
        <label ngpNumberFieldLabel data-testid="label">Quantity</label>
        <div ngpNumberFieldGroup data-testid="group">
          <button ngpNumberFieldDecrement data-testid="decrement">-</button>
          <input ngpNumberFieldInput data-testid="input" />
          <button ngpNumberFieldIncrement data-testid="increment">+</button>
        </div>
      </div>
    `;
  }

  it('should render with generated id', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    const numberField = screen.getByTestId('number-field');
    expect(numberField.id).toMatch(/^ngp-number-field/);
  });

  it('should set role="group" on the group element', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
  });

  it('should set aria-roledescription on the input', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('input')).toHaveAttribute(
      'aria-roledescription',
      'Number field',
    );
  });

  it('should set input type to text', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should set inputmode to text when min allows negative and step has decimals', async () => {
    await render(createTemplate('[ngpNumberFieldStep]="0.1"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'text');
  });

  it('should set inputmode to decimal when min >= 0 and step has decimals', async () => {
    await render(
      createTemplate('[ngpNumberFieldMin]="0" [ngpNumberFieldStep]="0.1"'),
      {
        imports,
        componentProperties: { valueChange: jest.fn() },
      },
    );

    expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'decimal');
  });

  it('should set inputmode to numeric when min >= 0 and step is integer', async () => {
    await render(createTemplate('[ngpNumberFieldMin]="0"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'numeric');
  });

  it('should display initial value', async () => {
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    await Promise.resolve();

    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('should increment value when clicking increment button', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledWith(6);
  });

  it('should decrement value when clicking decrement button', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('decrement'));
    expect(valueChange).toHaveBeenCalledWith(4);
  });

  it('should increment value with ArrowUp key', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
    expect(valueChange).toHaveBeenCalledWith(6);
  });

  it('should decrement value with ArrowDown key', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown' });
    expect(valueChange).toHaveBeenCalledWith(4);
  });

  it('should use large step with Shift+ArrowUp', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldLargeStep]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), {
      key: 'ArrowUp',
      shiftKey: true,
    });
    expect(valueChange).toHaveBeenCalledWith(15);
  });

  it('should use large step with Shift+ArrowDown', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="50" [ngpNumberFieldLargeStep]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), {
      key: 'ArrowDown',
      shiftKey: true,
    });
    expect(valueChange).toHaveBeenCalledWith(40);
  });

  it('should clamp value to min', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="0" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown' });
    // Should not have been called since value is already at min
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should clamp value to max', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="10" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
    // Should not have been called since value is already at max
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should set value to min on Home key', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'Home' });
    expect(valueChange).toHaveBeenCalledWith(0);
  });

  it('should set value to max on End key', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'End' });
    expect(valueChange).toHaveBeenCalledWith(10);
  });

  it('should respect step value', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate('[ngpNumberFieldValue]="0" [ngpNumberFieldStep]="5"'),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
    expect(valueChange).toHaveBeenCalledWith(5);
  });

  it('should disable increment button when value equals max', async () => {
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="10" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange: jest.fn() },
      },
    );

    expect(screen.getByTestId('increment')).toHaveAttribute('disabled');
  });

  it('should disable decrement button when value equals min', async () => {
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="0" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange: jest.fn() },
      },
    );

    expect(screen.getByTestId('decrement')).toHaveAttribute('disabled');
  });

  it('should set data-disabled when disabled', async () => {
    await render(createTemplate('[ngpNumberFieldDisabled]="true"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    const numberField = screen.getByTestId('number-field');
    const input = screen.getByTestId('input');

    expect(numberField).toHaveAttribute('data-disabled', '');
    expect(input).toHaveAttribute('data-disabled', '');
  });

  it('should not change value when disabled', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldDisabled]="true"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
    expect(valueChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should set data-readonly when readonly', async () => {
    await render(createTemplate('[ngpNumberFieldReadonly]="true"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    const numberField = screen.getByTestId('number-field');
    const input = screen.getByTestId('input');

    expect(numberField).toHaveAttribute('data-readonly', '');
    expect(input).toHaveAttribute('data-readonly', '');
    expect(input).toHaveAttribute('readonly');
  });

  it('should not change value when readonly', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldReadonly]="true"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should set aria-valuemin and aria-valuemax on the input', async () => {
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="100"',
      ),
      {
        imports,
        componentProperties: { valueChange: jest.fn() },
      },
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '100');
  });

  it('should set aria-valuenow on the input', async () => {
    await render(createTemplate('[ngpNumberFieldValue]="42"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-valuenow', '42');
  });

  it('should set aria-label on increment and decrement buttons', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('increment')).toHaveAttribute(
      'aria-label',
      'Increment',
    );
    expect(screen.getByTestId('decrement')).toHaveAttribute(
      'aria-label',
      'Decrement',
    );
  });

  it('should set tabindex=-1 on buttons', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('increment')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('decrement')).toHaveAttribute('tabindex', '-1');
  });

  it('should set type=button on increment and decrement buttons', async () => {
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('increment')).toHaveAttribute('type', 'button');
    expect(screen.getByTestId('decrement')).toHaveAttribute('type', 'button');
  });

  it('should commit value on blur', async () => {
    const valueChange = jest.fn();
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '42';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(42);
  });

  it('should clamp value on blur when out of range', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate('[ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"'),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '15';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(10);
    expect(input.value).toBe('10');
  });

  it('should set value to null when input is cleared', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(null);
  });

  it('should commit value on Enter key', async () => {
    const valueChange = jest.fn();
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '99';
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(valueChange).toHaveBeenCalledWith(99);
  });

  it('should disable input tabindex when disabled', async () => {
    await render(createTemplate('[ngpNumberFieldDisabled]="true"'), {
      imports,
      componentProperties: { valueChange: jest.fn() },
    });

    expect(screen.getByTestId('input')).toHaveAttribute('tabindex', '-1');
  });

  // Phase 1: Bug fix tests

  it('should handle floating point precision with step=0.1', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate('[ngpNumberFieldValue]="0" [ngpNumberFieldStep]="0.1"'),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    const input = screen.getByTestId('input');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(valueChange).toHaveBeenLastCalledWith(0.3);
  });

  it('should increment from null with no bounds to 0', async () => {
    const valueChange = jest.fn();
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledWith(1);
  });

  it('should increment from null with min=5 to min', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldMin]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledWith(6);
  });

  it('should decrement from null with max=10 to max', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldMax]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('decrement'));
    expect(valueChange).toHaveBeenCalledWith(9);
  });

  it('should decrement from null with no bounds to 0', async () => {
    const valueChange = jest.fn();
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('decrement'));
    expect(valueChange).toHaveBeenCalledWith(-1);
  });

  it('should snap to nearest step on blur', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldStep]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '6';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(5);
    expect(input.value).toBe('5');
  });

  it('should snap to nearest step rounding up on blur', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldStep]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '8';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(10);
    expect(input.value).toBe('10');
  });

  it('should parse partial decimal ".5" as 0.5', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldStep]="0.1"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '.5';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(0.5);
  });

  it('should set value to null when only "-" is typed and blurred', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '-';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(null);
  });

  it('should not emit when setting value to the same value', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    const input = screen.getByTestId('input') as HTMLInputElement;

    // Type the same value that's already set
    fireEvent.focus(input);
    input.value = '5';
    fireEvent.blur(input);

    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should revert display when invalid text is typed and blurred', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="5"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = 'abc';
    fireEvent.blur(input);

    // Invalid text should not change value, display should revert
    expect(valueChange).not.toHaveBeenCalled();
    expect(input.value).toBe('5');
  });

  it('should trim whitespace from input on blur', async () => {
    const valueChange = jest.fn();
    await render(createTemplate(), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '  42  ';
    fireEvent.blur(input);

    expect(valueChange).toHaveBeenCalledWith(42);
    expect(input.value).toBe('42');
  });

  // Phase 2: Ctrl+wheel guard

  it('should not change value on Ctrl+wheel (browser zoom)', async () => {
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldInputAllowWheelScrub]="true"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    const input = screen.getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);

    fireEvent.wheel(input, { deltaY: -1, ctrlKey: true });

    expect(valueChange).not.toHaveBeenCalled();
  });

  // Commit pending input before stepping

  it('should increment from typed value, not stale signal value', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    // Focus, clear, type "1"
    fireEvent.focus(input);
    input.value = '1';

    // Press ArrowUp — should increment from 1, not from 10
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(valueChange).toHaveBeenCalledWith(1);
    expect(valueChange).toHaveBeenCalledWith(2);
    expect(input.value).toBe('2');
  });

  it('should decrement from typed value, not stale signal value', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '5';

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(valueChange).toHaveBeenCalledWith(5);
    expect(valueChange).toHaveBeenCalledWith(4);
    expect(input.value).toBe('4');
  });

  it('should use typed value when increment button is clicked while focused', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    // Type a new value without blurring (button preventDefault keeps focus)
    fireEvent.focus(input);
    input.value = '1';

    fireEvent.pointerDown(screen.getByTestId('increment'));

    expect(valueChange).toHaveBeenCalledWith(1);
    expect(valueChange).toHaveBeenCalledWith(2);
  });

  it('should use typed value when decrement button is clicked while focused', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    // Type a new value without blurring (button preventDefault keeps focus)
    fireEvent.focus(input);
    input.value = '5';

    fireEvent.pointerDown(screen.getByTestId('decrement'));

    expect(valueChange).toHaveBeenCalledWith(5);
    expect(valueChange).toHaveBeenCalledWith(4);
  });

  it('should update display after button increment while focused', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '1';

    fireEvent.pointerDown(screen.getByTestId('increment'));

    // Wait for effect to sync the display
    await Promise.resolve();

    expect(input.value).toBe('2');
  });

  it('should allow multiple consecutive button clicks while focused', async () => {
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="10"'), {
      imports,
      componentProperties: { valueChange },
    });

    const input = screen.getByTestId('input') as HTMLInputElement;

    fireEvent.focus(input);
    input.value = '1';

    fireEvent.pointerDown(screen.getByTestId('increment'));
    // Effect syncs display asynchronously
    await Promise.resolve();

    fireEvent.pointerDown(screen.getByTestId('increment'));
    await Promise.resolve();

    fireEvent.pointerDown(screen.getByTestId('increment'));
    await Promise.resolve();

    expect(valueChange).toHaveBeenLastCalledWith(4);
    expect(input.value).toBe('4');
  });

  // Phase 3: Auto-repeat tests

  it('should auto-repeat increment on long press', async () => {
    jest.useFakeTimers();
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="0"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenLastCalledWith(1);

    // Advance past initial delay (400ms) + first interval tick (60ms)
    jest.advanceTimersByTime(460);
    const callsAfterDelay = valueChange.mock.calls.length;
    expect(callsAfterDelay).toBeGreaterThan(1);

    // Advance a few more intervals (60ms each)
    jest.advanceTimersByTime(180);
    expect(valueChange.mock.calls.length).toBeGreaterThan(callsAfterDelay);

    // Release pointer to stop repeat
    fireEvent.pointerUp(document);

    const callsAfterRelease = valueChange.mock.calls.length;
    jest.advanceTimersByTime(200);
    expect(valueChange.mock.calls.length).toBe(callsAfterRelease);

    jest.useRealTimers();
  });

  it('should auto-repeat decrement on long press', async () => {
    jest.useFakeTimers();
    const valueChange = jest.fn();
    await render(createTemplate('[ngpNumberFieldValue]="100"'), {
      imports,
      componentProperties: { valueChange },
    });

    fireEvent.pointerDown(screen.getByTestId('decrement'));
    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenLastCalledWith(99);

    // Advance past initial delay (400ms) + first interval tick (60ms)
    jest.advanceTimersByTime(460);
    const callsAfterDelay = valueChange.mock.calls.length;
    expect(callsAfterDelay).toBeGreaterThan(1);

    fireEvent.pointerUp(document);

    const callsAfterRelease = valueChange.mock.calls.length;
    jest.advanceTimersByTime(200);
    expect(valueChange.mock.calls.length).toBe(callsAfterRelease);

    jest.useRealTimers();
  });

  it('should stop auto-repeat when hitting max boundary', async () => {
    jest.useFakeTimers();
    const valueChange = jest.fn();
    await render(
      createTemplate(
        '[ngpNumberFieldValue]="8" [ngpNumberFieldMax]="10"',
      ),
      {
        imports,
        componentProperties: { valueChange },
      },
    );

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledWith(9);

    // Advance past delay + several intervals — should stop at max
    jest.advanceTimersByTime(1000);

    // Value should have reached 10 and stopped
    const lastCall = valueChange.mock.calls[valueChange.mock.calls.length - 1][0];
    expect(lastCall).toBe(10);

    fireEvent.pointerUp(document);
    jest.useRealTimers();
  });
});
