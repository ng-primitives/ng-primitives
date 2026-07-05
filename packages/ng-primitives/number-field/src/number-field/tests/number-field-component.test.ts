import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpNumberFieldDecrement } from '../../number-field-decrement/number-field-decrement';
import { NgpNumberFieldIncrement } from '../../number-field-increment/number-field-increment';
import { NgpNumberFieldInput } from '../../number-field-input/number-field-input';
import { NgpNumberField } from '../number-field';

/**
 * Inline fixture mirroring the reusable component at
 * `apps/components/src/app/pages/reusable-components/number-field/number-field.ts`.
 * The reusable component composes the primitives via `hostDirectives` and does
 * not implement `ControlValueAccessor`, so there is no forms integration to test.
 */
@Component({
  selector: 'app-number-field',
  hostDirectives: [
    {
      directive: NgpNumberField,
      inputs: [
        'ngpNumberFieldValue:value',
        'ngpNumberFieldMin:min',
        'ngpNumberFieldMax:max',
        'ngpNumberFieldStep:step',
        'ngpNumberFieldLargeStep:largeStep',
        'ngpNumberFieldDisabled:disabled',
        'ngpNumberFieldReadonly:readonly',
      ],
      outputs: ['ngpNumberFieldValueChange:valueChange'],
    },
  ],
  imports: [NgpNumberFieldInput, NgpNumberFieldIncrement, NgpNumberFieldDecrement],
  template: `
    <button ngpNumberFieldDecrement aria-label="Decrement" data-testid="decrement">−</button>
    <input ngpNumberFieldInput data-testid="input" />
    <button ngpNumberFieldIncrement aria-label="Increment" data-testid="increment">+</button>
  `,
})
class NumberFieldFixture {}

describe('NumberField (reusable component) — standalone', () => {
  it('renders the composed spinbutton with the correct ARIA', async () => {
    await render(`<app-number-field value="5" min="0" max="10"></app-number-field>`, {
      imports: [NumberFieldFixture],
    });

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveAttribute('aria-valuenow', '5');
  });

  it('exposes accessible increment/decrement buttons', async () => {
    await render(`<app-number-field value="5"></app-number-field>`, {
      imports: [NumberFieldFixture],
    });

    expect(screen.getByRole('button', { name: 'Increment' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Decrement' })).toHaveAttribute('type', 'button');
  });

  it('increments the value when the increment button is clicked', async () => {
    const { fixture } = await render(`<app-number-field value="5"></app-number-field>`, {
      imports: [NumberFieldFixture],
    });

    fireEvent.pointerDown(screen.getByTestId('increment'));
    await fixture.whenStable();

    expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('6');
  });

  it('decrements the value when the decrement button is clicked', async () => {
    const { fixture } = await render(`<app-number-field value="5"></app-number-field>`, {
      imports: [NumberFieldFixture],
    });

    fireEvent.pointerDown(screen.getByTestId('decrement'));
    await fixture.whenStable();

    expect((screen.getByTestId('input') as HTMLInputElement).value).toBe('4');
  });

  it('increments the value with the ArrowUp key', async () => {
    const { fixture } = await render(
      `<app-number-field value="5" min="0" max="10"></app-number-field>`,
      { imports: [NumberFieldFixture] },
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await fixture.whenStable();

    expect(input).toHaveAttribute('aria-valuenow', '6');
  });

  it('emits valueChange through the forwarded output', async () => {
    const valueChange = vi.fn();
    await render(
      `<app-number-field value="5" (valueChange)="valueChange($event)"></app-number-field>`,
      {
        imports: [NumberFieldFixture],
        componentProperties: { valueChange },
      },
    );

    fireEvent.pointerDown(screen.getByTestId('increment'));
    expect(valueChange).toHaveBeenCalledWith(6);
  });

  it('does not change the value with the keyboard when disabled', async () => {
    const { fixture } = await render(
      `<app-number-field value="5" disabled="true"></app-number-field>`,
      { imports: [NumberFieldFixture] },
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('disabled');
    expect(input).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await fixture.whenStable();

    expect(input).toHaveAttribute('aria-valuenow', '5');
  });

  it('disables the increment button at the maximum bound', async () => {
    await render(`<app-number-field value="10" min="0" max="10"></app-number-field>`, {
      imports: [NumberFieldFixture],
    });

    expect(screen.getByTestId('increment')).toHaveAttribute('disabled');
    expect(screen.getByTestId('decrement')).not.toHaveAttribute('disabled');
  });
});
