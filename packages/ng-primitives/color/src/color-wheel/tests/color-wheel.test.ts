import { fireEvent, render } from '@testing-library/angular';
import { Color, NgpColorWheel, NgpColorWheelThumb } from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

async function setup(props: { value?: Color; extra?: string } = {}) {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(
    `<div
        ngpColorWheel
        data-testid="wheel"
        [ngpColorWheelValue]="value"
        ${props.extra ?? ''}
        (ngpColorWheelValueChange)="onChange($event)">
       <div ngpColorWheelThumb data-testid="thumb"></div>
     </div>`,
    {
      imports: [NgpColorWheel, NgpColorWheelThumb],
      componentProperties: { value: props.value ?? Color.parse('hsl(0, 100%, 50%)'), onChange },
    },
  );
  return {
    ...view,
    onChange,
    wheel: view.getByTestId('wheel'),
    thumb: view.getByTestId('thumb'),
    last: () => onChange.mock.lastCall?.[0] as Color,
  };
}

describe('NgpColorWheel', () => {
  it('exposes the hue as an ARIA slider', async () => {
    const { thumb } = await setup({ value: Color.parse('hsl(120, 100%, 50%)') });
    expect(thumb).toHaveAttribute('role', 'slider');
    expect(thumb).toHaveAttribute('aria-label', 'Hue');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '360');
    expect(thumb).toHaveAttribute('aria-valuenow', '120');
  });

  it('exposes the hue angle and a conic gradient as CSS custom properties', async () => {
    const { wheel } = await setup({ value: Color.parse('hsl(90, 100%, 50%)') });
    expect(wheel.style.getPropertyValue('--ngp-color-wheel-hue')).toBe('90deg');
    expect(wheel.style.getPropertyValue('--ngp-color-wheel-background')).toContain(
      'conic-gradient(',
    );
  });

  it('adjusts hue with arrow keys, shift and Home/End', async () => {
    const { thumb, last } = await setup({ value: Color.parse('hsl(100, 100%, 50%)') });
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(last().getChannelValue('hue')).toBe(101);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft', shiftKey: true });
    expect(last().getChannelValue('hue')).toBe(91);
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(last().getChannelValue('hue')).toBe(0);
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(last().getChannelValue('hue')).toBe(360);
  });

  it('sets hue from the pointer angle around the center', async () => {
    const { wheel, last } = await setup();
    vi.spyOn(wheel, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 200,
      bottom: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    // click at the right edge -> 90° clockwise from top -> hue 90
    fireEvent.pointerDown(wheel, { clientX: 200, clientY: 100 });
    expect(last().getChannelValue('hue')).toBe(90);
    // click at the bottom -> 180°
    fireEvent.pointerDown(wheel, { clientX: 100, clientY: 200 });
    expect(last().getChannelValue('hue')).toBe(180);
  });

  it('does not respond when disabled', async () => {
    const { thumb, wheel, onChange } = await setup({ extra: '[ngpColorWheelDisabled]="true"' });
    expect(thumb).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    fireEvent.pointerDown(wheel, { clientX: 200, clientY: 100 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
