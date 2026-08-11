import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpNumberFieldDecrement } from '../../number-field-decrement/number-field-decrement';
import { NgpNumberFieldIncrement } from '../../number-field-increment/number-field-increment';
import { NgpNumberFieldInput } from '../../number-field-input/number-field-input';
import { NgpNumberField } from '../number-field';

describe('NgpNumberField', () => {
  const imports = [
    NgpNumberField,
    NgpNumberFieldInput,
    NgpNumberFieldIncrement,
    NgpNumberFieldDecrement,
  ];

  function createTemplate(extraProps = ''): string {
    return `
      <div
        ngpNumberField
        data-testid="number-field"
        (ngpNumberFieldValueChange)="valueChange($event)"
        ${extraProps}>
        <button ngpNumberFieldDecrement data-testid="decrement">-</button>
        <input ngpNumberFieldInput data-testid="input" />
        <button ngpNumberFieldIncrement data-testid="increment">+</button>
      </div>
    `;
  }

  function renderNumberField(extraProps = '', valueChange = vi.fn()) {
    return render(createTemplate(extraProps), {
      imports,
      componentProperties: { valueChange },
    });
  }

  describe('roles & attributes', () => {
    it('should set role="group" on the root element', async () => {
      await renderNumberField();
      expect(screen.getByTestId('number-field')).toHaveAttribute('role', 'group');
    });

    it('should set role="spinbutton" on the input', async () => {
      await renderNumberField();
      expect(screen.getByTestId('input')).toHaveAttribute('role', 'spinbutton');
    });

    it('should use a text input rather than a native number input', async () => {
      await renderNumberField();
      const input = screen.getByTestId('input');
      // A native type="number" would break custom formatting/stepping — the
      // primitive deliberately uses a text input with spinbutton semantics.
      expect(input).toHaveAttribute('type', 'text');
      expect(input).not.toHaveAttribute('type', 'number');
    });

    it('should render with a generated id on the input', async () => {
      await renderNumberField();
      expect(screen.getByTestId('input').id).toMatch(/^ngp-number-field/);
    });

    it('should set tabindex=-1 and type=button on the increment/decrement buttons', async () => {
      await renderNumberField();
      expect(screen.getByTestId('increment')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTestId('decrement')).toHaveAttribute('tabindex', '-1');
      expect(screen.getByTestId('increment')).toHaveAttribute('type', 'button');
      expect(screen.getByTestId('decrement')).toHaveAttribute('type', 'button');
    });

    it('should set inputmode to text when min allows negative and step has decimals', async () => {
      await renderNumberField('[ngpNumberFieldStep]="0.1"');
      expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'text');
    });

    it('should set inputmode to decimal when min >= 0 and step has decimals', async () => {
      await renderNumberField('[ngpNumberFieldMin]="0" [ngpNumberFieldStep]="0.1"');
      expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'decimal');
    });

    it('should set inputmode to numeric when min >= 0 and step is integer', async () => {
      await renderNumberField('[ngpNumberFieldMin]="0"');
      expect(screen.getByTestId('input')).toHaveAttribute('inputmode', 'numeric');
    });
  });

  describe('spinbutton ARIA', () => {
    it('should set aria-valuemin and aria-valuemax on the input', async () => {
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="100"',
      );
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-valuemin', '0');
      expect(input).toHaveAttribute('aria-valuemax', '100');
    });

    it('should set aria-valuenow to the current value', async () => {
      await renderNumberField('[ngpNumberFieldValue]="42"');
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '42');
    });

    it('should omit aria-valuemin/aria-valuemax when bounds are infinite', async () => {
      await renderNumberField('[ngpNumberFieldValue]="5"');
      const input = screen.getByTestId('input');
      expect(input).not.toHaveAttribute('aria-valuemin');
      expect(input).not.toHaveAttribute('aria-valuemax');
    });

    it('should update aria-valuenow after incrementing', async () => {
      const { fixture } = await renderNumberField('[ngpNumberFieldDefaultValue]="5"');
      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '6');
    });
  });

  describe('controlled mode (no round-trip)', () => {
    it('should emit valueChange on increment but not update the DOM when the parent does not update the binding', async () => {
      const valueChange = vi.fn();
      const { fixture } = await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);
      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();

      // notifies via valueChange, but the controlled value must stay put because
      // the parent never writes the new value back.
      expect(valueChange).toHaveBeenCalledWith(6);
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '5');
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('5');
    });
  });

  describe('two-way binding', () => {
    it('should round-trip a two-way binding and update the value on increment', async () => {
      const { fixture } = await render(
        `<div ngpNumberField [(ngpNumberFieldValue)]="value" data-testid="number-field">
          <button ngpNumberFieldDecrement data-testid="decrement">-</button>
          <input ngpNumberFieldInput data-testid="input" />
          <button ngpNumberFieldIncrement data-testid="increment">+</button>
        </div>`,
        { imports, componentProperties: { value: 5 } },
      );
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '5');

      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();

      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '6');
      expect(fixture.componentInstance.value).toBe(6);
    });
  });

  describe('defaultValue (uncontrolled)', () => {
    it('should display the default value on init', async () => {
      const { fixture } = await renderNumberField('[ngpNumberFieldDefaultValue]="5"');
      await fixture.whenStable();
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('5');
    });

    it('should let interaction override the default value (uncontrolled)', async () => {
      const { fixture } = await renderNumberField('[ngpNumberFieldDefaultValue]="5"');
      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '6');
    });

    it('should prefer a controlled value over the default value', async () => {
      const { fixture } = await renderNumberField(
        '[ngpNumberFieldValue]="3" [ngpNumberFieldDefaultValue]="8"',
      );
      await fixture.whenStable();
      expect(screen.getByTestId('input')).toHaveAttribute('aria-valuenow', '3');
    });
  });

  describe('value / min / max / step', () => {
    it('should display the initial value', async () => {
      const { fixture } = await renderNumberField('[ngpNumberFieldValue]="5"');
      await fixture.whenStable();
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('5');
    });

    it('should respect the step value when incrementing', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="0" [ngpNumberFieldStep]="5"', valueChange);
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).toHaveBeenCalledWith(5);
    });

    it('should handle floating point precision with step=0.1', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="0" [ngpNumberFieldStep]="0.1"',
        valueChange,
      );

      const input = screen.getByTestId('input');
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(valueChange).toHaveBeenLastCalledWith(0.3);
    });

    it('should preserve precision when min has more decimal places than step', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="33.5" [ngpNumberFieldMin]="32.5" [ngpNumberFieldStep]="1"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).toHaveBeenCalledWith(34.5);
    });

    it('should not emit when setting the value to the current value', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '5';
      fireEvent.blur(input);

      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should reject NaN passed to setValue', async () => {
      const valueChange = vi.fn();
      const { fixture } = await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);

      const numberField = fixture.debugElement.children[0].injector.get(NgpNumberField);
      numberField.setValue(NaN);

      expect(valueChange).not.toHaveBeenCalled();
      await fixture.whenStable();
      expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('5');
    });
  });

  describe('increment / decrement buttons', () => {
    it('should increment the value when clicking the increment button', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);
      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).toHaveBeenCalledWith(6);
    });

    it('should decrement the value when clicking the decrement button', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);
      fireEvent.pointerDown(screen.getByTestId('decrement'));
      expect(valueChange).toHaveBeenCalledWith(4);
    });

    it('should increment from null with no bounds to a single step', async () => {
      const valueChange = vi.fn();
      await renderNumberField('', valueChange);
      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).toHaveBeenCalledWith(1);
    });

    it('should increment from null starting at min when min is set', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldMin]="5"', valueChange);
      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).toHaveBeenCalledWith(6);
    });

    it('should decrement from null starting at max when max is set', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldMax]="10"', valueChange);
      fireEvent.pointerDown(screen.getByTestId('decrement'));
      expect(valueChange).toHaveBeenCalledWith(9);
    });

    it('should decrement from null with no bounds to a negative step', async () => {
      const valueChange = vi.fn();
      await renderNumberField('', valueChange);
      fireEvent.pointerDown(screen.getByTestId('decrement'));
      expect(valueChange).toHaveBeenCalledWith(-1);
    });

    it('should disable the increment button when the value equals max', async () => {
      await renderNumberField(
        '[ngpNumberFieldValue]="10" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      );
      expect(screen.getByTestId('increment')).toHaveAttribute('disabled');
      expect(screen.getByTestId('increment')).toHaveAttribute('data-disabled', '');
    });

    it('should disable the decrement button when the value equals min', async () => {
      await renderNumberField(
        '[ngpNumberFieldValue]="0" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
      );
      expect(screen.getByTestId('decrement')).toHaveAttribute('disabled');
      expect(screen.getByTestId('decrement')).toHaveAttribute('data-disabled', '');
    });

    it('should be inert when the increment button is already disabled at max', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="10" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should be inert when the decrement button is already disabled at min', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="0" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.pointerDown(screen.getByTestId('decrement'));
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should use the typed value when the increment button is clicked while focused', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldDefaultValue]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '1';

      fireEvent.pointerDown(screen.getByTestId('increment'));

      // Only the final stepped value should be emitted (not the intermediate commit)
      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenCalledWith(2);
    });

    it('should use the typed value when the decrement button is clicked while focused', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldDefaultValue]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '5';

      fireEvent.pointerDown(screen.getByTestId('decrement'));

      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenCalledWith(4);
    });

    it('should update the display after a button increment while focused', async () => {
      const { fixture } = await renderNumberField('[ngpNumberFieldDefaultValue]="10"');

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '1';

      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();

      expect(input.value).toBe('2');
    });

    it('should allow multiple consecutive button clicks while focused', async () => {
      const valueChange = vi.fn();
      const { fixture } = await renderNumberField('[ngpNumberFieldDefaultValue]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '1';

      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();
      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();
      fireEvent.pointerDown(screen.getByTestId('increment'));
      await fixture.whenStable();

      expect(valueChange).toHaveBeenLastCalledWith(4);
      expect(input.value).toBe('4');
    });
  });

  describe('keyboard', () => {
    it('should increment the value with ArrowUp', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).toHaveBeenCalledWith(6);
    });

    it('should decrement the value with ArrowDown', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown' });
      expect(valueChange).toHaveBeenCalledWith(4);
    });

    it('should use the large step with Shift+ArrowUp', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="5" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp', shiftKey: true });
      expect(valueChange).toHaveBeenCalledWith(15);
    });

    it('should use the large step with Shift+ArrowDown', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="50" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown', shiftKey: true });
      expect(valueChange).toHaveBeenCalledWith(40);
    });

    it('should set the value to min on Home', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'Home' });
      expect(valueChange).toHaveBeenCalledWith(0);
    });

    it('should set the value to max on End', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'End' });
      expect(valueChange).toHaveBeenCalledWith(10);
    });

    it('should increment from the typed value rather than the stale signal value', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldDefaultValue]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '1';
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenCalledWith(2);
      expect(input.value).toBe('2');
    });

    it('should decrement from the typed value rather than the stale signal value', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldDefaultValue]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '5';
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenCalledWith(4);
      expect(input.value).toBe('4');
    });

    // WAI-ARIA spinbutton pattern: PageUp/PageDown change the value by the large step.
    it('should increment by the large step on PageUp', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="5" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'PageUp' });
      expect(valueChange).toHaveBeenCalledWith(15);
      expect(input.value).toBe('15');
    });

    it('should decrement by the large step on PageDown', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="50" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'PageDown' });
      expect(valueChange).toHaveBeenCalledWith(40);
      expect(input.value).toBe('40');
    });

    it('should use the default large step (10) on PageUp when not specified', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="0"', valueChange);
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'PageUp' });
      expect(valueChange).toHaveBeenCalledWith(10);
    });

    it('should not change the value on PageUp/PageDown when disabled', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldDisabled]="true"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'PageUp' });
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'PageDown' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should clamp to max on PageUp near the maximum', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="95" [ngpNumberFieldMax]="100" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'PageUp' });
      expect(valueChange).toHaveBeenCalledWith(100);
    });
  });

  describe('clamping to min / max', () => {
    it('should not emit when pressing ArrowDown at the minimum', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="0" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should not emit when pressing ArrowUp at the maximum', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="10" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should clamp an incremented value to max when a large step overshoots', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="8" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp', shiftKey: true });
      expect(valueChange).toHaveBeenCalledWith(10);
    });

    it('should clamp a decremented value to min when a large step overshoots', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="2" [ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10" [ngpNumberFieldLargeStep]="10"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowDown', shiftKey: true });
      expect(valueChange).toHaveBeenCalledWith(0);
    });

    it('should clamp the value to max on blur when out of range', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldMin]="0" [ngpNumberFieldMax]="10"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '15';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(10);
      expect(input.value).toBe('10');
    });
  });

  describe('input commit (blur / Enter)', () => {
    it('should commit the value on blur', async () => {
      const valueChange = vi.fn();
      await renderNumberField('', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '42';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(42);
    });

    it('should commit the value on Enter', async () => {
      const valueChange = vi.fn();
      await renderNumberField('', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '99';
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(valueChange).toHaveBeenCalledWith(99);
    });

    it('should set the value to null when the input is cleared', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(null);
    });

    it('should set the value to null when only "-" is typed and blurred', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '-';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(null);
    });

    it('should snap to the nearest step on blur (rounding down)', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldStep]="5"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '6';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(5);
      expect(input.value).toBe('5');
    });

    it('should snap to the nearest step on blur (rounding up)', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldStep]="5"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '8';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(10);
      expect(input.value).toBe('10');
    });

    it('should parse a partial decimal ".5" as 0.5', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldStep]="0.1"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '.5';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(0.5);
    });

    it('should revert the display when invalid text is typed and blurred', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="5"', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = 'abc';
      fireEvent.blur(input);

      expect(valueChange).not.toHaveBeenCalled();
      expect(input.value).toBe('5');
    });

    it('should trim whitespace from the input on blur', async () => {
      const valueChange = vi.fn();
      await renderNumberField('', valueChange);

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      input.value = '  42  ';
      fireEvent.blur(input);

      expect(valueChange).toHaveBeenCalledWith(42);
      expect(input.value).toBe('42');
    });
  });

  describe('disabled', () => {
    it('should set data-disabled and the disabled attribute when disabled', async () => {
      await renderNumberField('[ngpNumberFieldDisabled]="true"');

      const numberField = screen.getByTestId('number-field');
      const input = screen.getByTestId('input');

      expect(numberField).toHaveAttribute('data-disabled', '');
      expect(input).toHaveAttribute('data-disabled', '');
      expect(input).toHaveAttribute('disabled');
    });

    it('should set the input tabindex to -1 when disabled', async () => {
      await renderNumberField('[ngpNumberFieldDisabled]="true"');
      expect(screen.getByTestId('input')).toHaveAttribute('tabindex', '-1');
    });

    it('should not change the value via keyboard or button when disabled', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldDisabled]="true"',
        valueChange,
      );

      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).not.toHaveBeenCalled();

      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('readonly', () => {
    it('should set data-readonly and the readonly attribute when readonly', async () => {
      await renderNumberField('[ngpNumberFieldReadonly]="true"');

      const numberField = screen.getByTestId('number-field');
      const input = screen.getByTestId('input');

      expect(numberField).toHaveAttribute('data-readonly', '');
      expect(input).toHaveAttribute('data-readonly', '');
      expect(input).toHaveAttribute('readonly');
    });

    it('should not change the value via keyboard when readonly', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldValue]="5" [ngpNumberFieldReadonly]="true"',
        valueChange,
      );
      fireEvent.keyDown(screen.getByTestId('input'), { key: 'ArrowUp' });
      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('mouse wheel', () => {
    it('should not change the value on Ctrl+wheel (browser zoom)', async () => {
      const valueChange = vi.fn();
      // `allowWheelScrub` is an input-level directive input, so it must be bound
      // on the input element, not the number-field root.
      await render(
        `
          <div
            ngpNumberField
            data-testid="number-field"
            [ngpNumberFieldValue]="5"
            (ngpNumberFieldValueChange)="valueChange($event)">
            <button ngpNumberFieldDecrement data-testid="decrement">-</button>
            <input ngpNumberFieldInput data-testid="input" ngpNumberFieldInputAllowWheelScrub />
            <button ngpNumberFieldIncrement data-testid="increment">+</button>
          </div>
        `,
        { imports, componentProperties: { valueChange } },
      );

      const input = screen.getByTestId('input') as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.wheel(input, { deltaY: -1, ctrlKey: true });

      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('auto-repeat', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('should auto-repeat increment on long press and stop on release', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="0"', valueChange);

      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenLastCalledWith(1);

      // Advance past initial delay (400ms) + first interval tick (60ms)
      vi.advanceTimersByTime(460);
      const callsAfterDelay = valueChange.mock.calls.length;
      expect(callsAfterDelay).toBeGreaterThan(1);

      vi.advanceTimersByTime(180);
      expect(valueChange.mock.calls.length).toBeGreaterThan(callsAfterDelay);

      fireEvent.pointerUp(document);

      const callsAfterRelease = valueChange.mock.calls.length;
      vi.advanceTimersByTime(200);
      expect(valueChange.mock.calls.length).toBe(callsAfterRelease);
    });

    it('should auto-repeat decrement on long press and stop on release', async () => {
      const valueChange = vi.fn();
      await renderNumberField('[ngpNumberFieldValue]="100"', valueChange);

      fireEvent.pointerDown(screen.getByTestId('decrement'));
      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(valueChange).toHaveBeenLastCalledWith(99);

      vi.advanceTimersByTime(460);
      const callsAfterDelay = valueChange.mock.calls.length;
      expect(callsAfterDelay).toBeGreaterThan(1);

      fireEvent.pointerUp(document);

      const callsAfterRelease = valueChange.mock.calls.length;
      vi.advanceTimersByTime(200);
      expect(valueChange.mock.calls.length).toBe(callsAfterRelease);
    });

    it('should stop auto-repeat when hitting the max boundary', async () => {
      const valueChange = vi.fn();
      await renderNumberField(
        '[ngpNumberFieldDefaultValue]="8" [ngpNumberFieldMax]="10"',
        valueChange,
      );

      fireEvent.pointerDown(screen.getByTestId('increment'));
      expect(valueChange).toHaveBeenCalledWith(9);

      vi.advanceTimersByTime(1000);

      const lastCall = valueChange.mock.calls[valueChange.mock.calls.length - 1][0];
      expect(lastCall).toBe(10);

      fireEvent.pointerUp(document);
    });
  });
});
