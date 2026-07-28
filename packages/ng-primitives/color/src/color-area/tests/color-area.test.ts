import { fireEvent, render } from '@testing-library/angular';
import { Color, NgpColorArea, NgpColorAreaThumb } from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpColorArea, NgpColorAreaThumb];

function template(extra = ''): string {
  return `
    <div
      ngpColorArea
      data-testid="area"
      [ngpColorAreaDefaultValue]="value"
      ${extra}
      (ngpColorAreaValueChange)="onChange($event)">
      <div ngpColorAreaThumb data-testid="thumb"></div>
    </div>
  `;
}

async function setup(props: { value?: Color; extra?: string } = {}) {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(template(props.extra), {
    imports,
    componentProperties: {
      value: props.value ?? Color.parse('hsb(0, 100%, 100%)'),
      onChange,
    },
  });
  return { ...view, onChange, last: () => onChange.mock.lastCall?.[0] as Color };
}

describe('NgpColorArea', () => {
  it('exposes a slider thumb describing both channels', async () => {
    const { getByTestId } = await setup({ value: Color.parse('hsb(0, 50%, 50%)') });
    const thumb = getByTestId('thumb');
    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('aria-label', 'saturation and brightness');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '50'); // x = saturation
    expect(thumb).toHaveAttribute('aria-valuetext', 'saturation 50, brightness 50');
  });

  it('positions the thumb from both channel percentages (y inverted)', async () => {
    const { getByTestId } = await setup({ value: Color.parse('hsb(0, 25%, 75%)') });
    const thumb = getByTestId('thumb');
    expect(thumb.style.getPropertyValue('inset-inline-start')).toBe('25%');
    // brightness 75 -> 75% up -> 25% from the top
    expect(thumb.style.getPropertyValue('inset-block-start')).toBe('25%');
  });

  it('moves the x channel with left/right arrows', async () => {
    const { getByTestId, last } = await setup({ value: Color.parse('hsb(0, 50%, 50%)') });
    const thumb = getByTestId('thumb');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(last().getChannelValue('saturation')).toBe(51);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(last().getChannelValue('saturation')).toBe(50);
  });

  it('moves the y channel with up/down arrows', async () => {
    const { getByTestId, last } = await setup({ value: Color.parse('hsb(0, 50%, 50%)') });
    const thumb = getByTestId('thumb');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(last().getChannelValue('brightness')).toBe(51);
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(last().getChannelValue('brightness')).toBe(50);
  });

  it('uses a x10 step with shift', async () => {
    const { getByTestId, last } = await setup({ value: Color.parse('hsb(0, 50%, 50%)') });
    fireEvent.keyDown(getByTestId('thumb'), { key: 'ArrowUp', shiftKey: true });
    expect(last().getChannelValue('brightness')).toBe(60);
  });

  it('sets both channels from a pointer position on the surface', async () => {
    const { getByTestId, last } = await setup();
    const area = getByTestId('area');
    vi.spyOn(area, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.pointerDown(area, { clientX: 25, clientY: 75 });
    // x = 25% -> saturation 25; y inverted (75px down of 100) -> brightness 25
    expect(last().getChannelValue('saturation')).toBe(25);
    expect(last().getChannelValue('brightness')).toBe(25);
  });

  it('exposes a 2D gradient background as a CSS custom property', async () => {
    const { getByTestId } = await setup();
    const bg = getByTestId('area').style.getPropertyValue('--ngp-color-area-background');
    expect(bg).toContain('linear-gradient(to top, #000');
    expect(bg).toContain('linear-gradient(to right, #fff');
  });

  it('does not respond when disabled', async () => {
    const { getByTestId, onChange } = await setup({ extra: '[ngpColorAreaDisabled]="true"' });
    const thumb = getByTestId('thumb');
    expect(thumb).toHaveAttribute('tabindex', '-1');
    expect(thumb).toHaveAttribute('data-disabled', '');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    fireEvent.pointerDown(getByTestId('area'), { clientX: 10, clientY: 10 });
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('value binding (standalone)', () => {
    it('one-way controlled: emits but does not move the thumb without a round-trip', async () => {
      const onChange = vi.fn<(c: Color) => void>();
      const { getByTestId } = await render(
        `<div ngpColorArea [ngpColorAreaValue]="value" (ngpColorAreaValueChange)="onChange($event)" data-testid="area">
           <div ngpColorAreaThumb data-testid="thumb"></div>
         </div>`,
        { imports, componentProperties: { value: Color.parse('hsb(0, 50%, 50%)'), onChange } },
      );
      const thumb = getByTestId('thumb');
      expect(thumb).toHaveAttribute('aria-valuenow', '50');

      fireEvent.keyDown(thumb, { key: 'ArrowRight' });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(thumb).toHaveAttribute('aria-valuenow', '50');
    });

    it('two-way: round-trips and moves the thumb', async () => {
      const { getByTestId } = await render(
        `<div ngpColorArea [(ngpColorAreaValue)]="value" data-testid="area">
           <div ngpColorAreaThumb data-testid="thumb"></div>
         </div>`,
        { imports, componentProperties: { value: Color.parse('hsb(0, 50%, 50%)') } },
      );
      const thumb = getByTestId('thumb');
      expect(thumb).toHaveAttribute('aria-valuenow', '50');

      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      expect(thumb).toHaveAttribute('aria-valuenow', '51');
    });
  });
});
