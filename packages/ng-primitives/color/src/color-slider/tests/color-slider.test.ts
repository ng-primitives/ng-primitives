import { fireEvent, render } from '@testing-library/angular';
import { Color } from 'ng-primitives/color';
import { NgpColorSlider, NgpColorSliderThumb, NgpColorSliderTrack } from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpColorSlider, NgpColorSliderTrack, NgpColorSliderThumb];

function template(extra = ''): string {
  return `
    <div
      ngpColorSlider
      data-testid="slider"
      [ngpColorSliderValue]="value"
      [ngpColorSliderChannel]="channel"
      ${extra}
      (ngpColorSliderValueChange)="onChange($event)">
      <div ngpColorSliderTrack data-testid="track"></div>
      <div ngpColorSliderThumb data-testid="thumb"></div>
    </div>
  `;
}

async function setup(props: { value?: Color; channel?: string; extra?: string } = {}) {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(template(props.extra), {
    imports,
    componentProperties: {
      value: props.value ?? Color.parse('#ff0000'),
      channel: props.channel ?? 'hue',
      onChange,
    },
  });
  return { ...view, onChange, last: () => onChange.mock.lastCall?.[0] as Color };
}

describe('NgpColorSlider', () => {
  it('exposes the channel as an ARIA slider', async () => {
    const { getByTestId } = await setup(); // red, hue channel -> hsb hue = 0
    const thumb = getByTestId('thumb');
    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('aria-label', 'hue');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '360');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    expect(thumb).toHaveAttribute('aria-orientation', 'horizontal');
    expect(thumb).toHaveAttribute('aria-valuetext', 'hue 0');
  });

  it('positions the thumb by channel percentage', async () => {
    const { getByTestId } = await setup({ value: Color.parse('hsb(180, 100%, 100%)') });
    // hue 180 of 360 -> 50%
    expect(getByTestId('thumb').style.getPropertyValue('inset-inline-start')).toBe('50%');
  });

  it('increments the channel on ArrowUp and emits a Color', async () => {
    const { getByTestId, last } = await setup();
    fireEvent.keyDown(getByTestId('thumb'), { key: 'ArrowUp' });
    expect(last().getChannelValue('hue')).toBe(1);
  });

  it('uses a x10 step with shift', async () => {
    const { getByTestId, last } = await setup();
    fireEvent.keyDown(getByTestId('thumb'), { key: 'ArrowUp', shiftKey: true });
    expect(last().getChannelValue('hue')).toBe(10);
  });

  it('Home/End jump to channel min/max', async () => {
    const { getByTestId, last } = await setup({ value: Color.parse('hsb(200,100%,100%)') });
    fireEvent.keyDown(getByTestId('thumb'), { key: 'Home' });
    expect(last().getChannelValue('hue')).toBe(0);
    fireEvent.keyDown(getByTestId('thumb'), { key: 'End' });
    expect(last().getChannelValue('hue')).toBe(360);
  });

  it('operates on an rgb channel with the right range', async () => {
    const { getByTestId, last } = await setup({
      value: Color.parse('#3366cc'),
      channel: 'red',
    });
    const thumb = getByTestId('thumb');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '255');
    expect(thumb).toHaveAttribute('aria-valuenow', '51');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(last().getChannelValue('red')).toBe(52);
  });

  it('sets the channel from a track click position', async () => {
    const { getByTestId, last } = await setup();
    const track = getByTestId('track');
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 10,
      width: 100,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.pointerDown(track, { clientX: 50, clientY: 5 });
    expect(last().getChannelValue('hue')).toBe(180);
  });

  it('exposes a channel gradient as a CSS custom property', async () => {
    const { getByTestId } = await setup();
    const bg = getByTestId('slider').style.getPropertyValue('--ngp-color-slider-background');
    expect(bg).toContain('linear-gradient(to right');
    expect(bg).toContain('rgba(');
  });

  it('does not respond to keyboard when disabled', async () => {
    const { getByTestId, onChange } = await setup({ extra: '[ngpColorSliderDisabled]="true"' });
    const thumb = getByTestId('thumb');
    expect(thumb).toHaveAttribute('tabindex', '-1');
    expect(thumb).toHaveAttribute('data-disabled', '');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
