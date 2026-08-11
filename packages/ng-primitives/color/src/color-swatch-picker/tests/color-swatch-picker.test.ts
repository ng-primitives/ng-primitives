import { fireEvent, render } from '@testing-library/angular';
import { Color, NgpColorSwatchPicker, NgpColorSwatchPickerItem } from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpColorSwatchPicker, NgpColorSwatchPickerItem];

async function setup(selected = '#ff0000') {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(
    `<div
        ngpColorSwatchPicker
        data-testid="picker"
        [ngpColorSwatchPickerDefaultValue]="value"
        (ngpColorSwatchPickerValueChange)="onChange($event)">
       <button [ngpColorSwatchPickerItem]="red" data-testid="red"></button>
       <button [ngpColorSwatchPickerItem]="green" data-testid="green"></button>
       <button [ngpColorSwatchPickerItem]="blue" data-testid="blue"></button>
     </div>`,
    {
      imports,
      componentProperties: {
        value: Color.parse(selected),
        red: Color.parse('#ff0000'),
        green: Color.parse('#00ff00'),
        blue: Color.parse('#0000ff'),
        onChange,
      },
    },
  );
  return {
    ...view,
    onChange,
    picker: view.getByTestId('picker'),
    red: view.getByTestId('red'),
    green: view.getByTestId('green'),
    blue: view.getByTestId('blue'),
    last: () => onChange.mock.lastCall?.[0] as Color,
  };
}

describe('NgpColorSwatchPicker', () => {
  it('renders a listbox of option swatches with the selected one marked', async () => {
    const { picker, red, green } = await setup('#ff0000');
    expect(picker).toHaveAttribute('role', 'listbox');
    expect(red).toHaveAttribute('role', 'option');
    expect(red).toHaveAttribute('aria-selected', 'true');
    expect(red).toHaveAttribute('data-selected', '');
    expect(green).toHaveAttribute('aria-selected', 'false');
  });

  it('exposes each swatch color as a CSS var', async () => {
    const { green } = await setup();
    expect(green.style.getPropertyValue('--ngp-color-swatch-color')).toBe('rgba(0, 255, 0, 1)');
  });

  it('selects a swatch on click', async () => {
    const { green, red, last } = await setup('#ff0000');
    fireEvent.click(green);
    expect(last().toHex()).toBe('#00ff00');
    expect(green).toHaveAttribute('aria-selected', 'true');
    expect(red).toHaveAttribute('aria-selected', 'false');
  });

  it('selects a swatch with Enter and Space', async () => {
    const { blue, green, onChange } = await setup('#ff0000');
    fireEvent.keyDown(blue, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(expect.anything());
    expect(blue).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(green, { key: ' ' });
    expect(green).toHaveAttribute('aria-selected', 'true');
  });

  it('uses a single tab stop across the swatches (roving focus)', async () => {
    const { red, green, blue } = await setup();
    const stops = [red, green, blue].filter(el => el.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
  });

  describe('value binding (standalone)', () => {
    const template = (binding: string) => `
      <div ngpColorSwatchPicker ${binding} (ngpColorSwatchPickerValueChange)="onChange($event)">
        <button [ngpColorSwatchPickerItem]="red" data-testid="red"></button>
        <button [ngpColorSwatchPickerItem]="green" data-testid="green"></button>
      </div>`;
    const props = (onChange: unknown) => ({
      value: Color.parse('#ff0000'),
      red: Color.parse('#ff0000'),
      green: Color.parse('#00ff00'),
      onChange,
    });

    it('one-way controlled: emits but keeps the selection without a round-trip', async () => {
      const onChange = vi.fn<(c: Color) => void>();
      const view = await render(template('[ngpColorSwatchPickerValue]="value"'), {
        imports,
        componentProperties: props(onChange),
      });
      const red = view.getByTestId('red');
      const green = view.getByTestId('green');
      expect(red).toHaveAttribute('data-selected', '');

      fireEvent.click(green);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(red).toHaveAttribute('data-selected', '');
      expect(green).not.toHaveAttribute('data-selected');
    });

    it('two-way: round-trips and moves the selection', async () => {
      const view = await render(template('[(ngpColorSwatchPickerValue)]="value"'), {
        imports,
        componentProperties: props(vi.fn()),
      });
      const red = view.getByTestId('red');
      const green = view.getByTestId('green');

      fireEvent.click(green);

      expect(green).toHaveAttribute('data-selected', '');
      expect(red).not.toHaveAttribute('data-selected');
    });
  });
});
