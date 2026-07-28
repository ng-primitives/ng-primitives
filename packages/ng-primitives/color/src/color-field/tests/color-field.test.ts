import { fireEvent, render } from '@testing-library/angular';
import { Color, NgpColorField } from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

async function setup(props: { value?: Color; channel?: string; extra?: string } = {}) {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(
    `<input
        ngpColorField
        data-testid="field"
        [ngpColorFieldDefaultValue]="value"
        ${props.channel ? `ngpColorFieldChannel="${props.channel}"` : ''}
        ${props.extra ?? ''}
        (ngpColorFieldValueChange)="onChange($event)" />`,
    {
      imports: [NgpColorField],
      componentProperties: {
        value: props.value ?? Color.parse('#ff0000'),
        onChange,
      },
    },
  );
  const input = view.getByTestId('field') as HTMLInputElement;
  return { ...view, input, onChange, last: () => onChange.mock.lastCall?.[0] as Color };
}

describe('NgpColorField', () => {
  describe('hex mode', () => {
    it('renders the color as a hex string', async () => {
      const { input } = await setup({ value: Color.parse('#3366cc') });
      expect(input.value).toBe('#3366cc');
      expect(input).toHaveAttribute('inputmode', 'text');
    });

    it('renders alpha as an 8-digit hex', async () => {
      const { input } = await setup({ value: Color.parse('rgba(255,0,0,0.5)') });
      expect(input.value).toBe('#ff000080');
    });

    it('commits a valid hex on blur and emits a Color', async () => {
      const { input, last } = await setup();
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '#00ff00' } });
      fireEvent.blur(input);
      expect(last().toHex()).toBe('#00ff00');
      expect(input.value).toBe('#00ff00');
    });

    it('reverts invalid input on blur', async () => {
      const { input, onChange } = await setup({ value: Color.parse('#ff0000') });
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '#12' } }); // too short
      fireEvent.blur(input);
      expect(onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('#ff0000');
    });

    it('strips non-hex characters as you type', async () => {
      const { input } = await setup();
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '#00zzff' } });
      expect(input.value).toBe('#00ff');
    });
  });

  describe('channel mode', () => {
    it('renders a single channel as a number', async () => {
      const { input } = await setup({ value: Color.parse('#3366cc'), channel: 'red' });
      expect(input.value).toBe('51');
      expect(input).toHaveAttribute('inputmode', 'numeric');
    });

    it('renders the fractional alpha channel without rounding to an integer', async () => {
      const { input } = await setup({ value: Color.parse('rgba(255,0,0,0.5)'), channel: 'alpha' });
      expect(input.value).toBe('0.5');
    });

    it('steps the channel with ArrowUp/ArrowDown', async () => {
      const { input, last } = await setup({ value: Color.parse('#3366cc'), channel: 'red' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(last().getChannelValue('red')).toBe(52);
      expect(input.value).toBe('52');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(last().getChannelValue('red')).toBe(51);
    });

    it('commits a typed number clamped to the channel range', async () => {
      const { input, last } = await setup({ value: Color.parse('#3366cc'), channel: 'red' });
      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '999' } });
      fireEvent.blur(input);
      expect(last().getChannelValue('red')).toBe(255);
      expect(input.value).toBe('255');
    });
  });

  it('does not commit or step when disabled', async () => {
    const { input, onChange } = await setup({
      channel: 'red',
      extra: '[ngpColorFieldDisabled]="true"',
    });
    expect(input).toHaveAttribute('disabled');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('value binding (standalone)', () => {
    it('one-way controlled: emits on blur but reverts the input without a round-trip', async () => {
      const onChange = vi.fn<(c: Color) => void>();
      const view = await render(
        `<input ngpColorField data-testid="field" [ngpColorFieldValue]="value"
                (ngpColorFieldValueChange)="onChange($event)" />`,
        {
          imports: [NgpColorField],
          componentProperties: { value: Color.parse('#ff0000'), onChange },
        },
      );
      const input = view.getByTestId('field') as HTMLInputElement;
      expect(input.value).toBe('#ff0000');

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '#00ff00' } });
      fireEvent.blur(input);

      // emitted, but controlled value is not written back, so the field reverts
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(input.value).toBe('#ff0000');
    });

    it('two-way: round-trips the committed value', async () => {
      const view = await render(
        `<input ngpColorField data-testid="field" [(ngpColorFieldValue)]="value" />`,
        { imports: [NgpColorField], componentProperties: { value: Color.parse('#ff0000') } },
      );
      const input = view.getByTestId('field') as HTMLInputElement;
      expect(input.value).toBe('#ff0000');

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '#00ff00' } });
      fireEvent.blur(input);

      expect(input.value).toBe('#00ff00');
    });
  });
});
