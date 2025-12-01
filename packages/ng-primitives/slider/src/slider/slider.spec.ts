import { fireEvent, render } from '@testing-library/angular';
import { NgpSliderRange } from '../slider-range/slider-range';
import { NgpSliderThumb } from '../slider-thumb/slider-thumb';
import { NgpSliderTrack } from '../slider-track/slider-track';
import { NgpSlider } from './slider';

describe('NgpSlider', () => {
  function createTemplate(extraProps = ''): string {
    return `
      <div
        ngpSlider
        data-testid="slider"
        (ngpSliderValueChange)="valueChange($event)"
        ${extraProps}>
        <div ngpSliderTrack data-testid="track"></div>
        <div ngpSliderRange data-testid="range"></div>
        <div ngpSliderThumb data-testid="thumb"></div>
      </div>
    `;
  }

  it('should render with generated id and orientation', async () => {
    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { valueChange: jest.fn() },
    });

    const slider = getByTestId('slider');
    expect(slider.id).toMatch(/^ngp-slider/);
    expect(slider).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should respect disabled state (attributes and interactions)', async () => {
    const valueChange = jest.fn();
    const { getByTestId, rerender } = await render(
      createTemplate(`[ngpSliderDisabled]="disabled"`),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { disabled: true, valueChange },
      },
    );

    const slider = getByTestId('slider');
    const thumb = getByTestId('thumb');

    expect(slider).toHaveAttribute('data-disabled', '');
    expect(thumb).toHaveAttribute('data-disabled', '');
    expect(thumb).toHaveAttribute('tabindex', '-1');

    fireEvent.pointerDown(getByTestId('track'));
    expect(valueChange).not.toHaveBeenCalled();

    await rerender({ componentProperties: { disabled: false, valueChange } });
    expect(thumb).toHaveAttribute('tabindex', '0');
  });

  it('should adjust value with keyboard on thumb', async () => {
    const valueChange = jest.fn();
    const { getByTestId } = await render(
      createTemplate(`[ngpSliderValue]="value" [ngpSliderMin]="0" [ngpSliderMax]="10"`),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { value: 5, valueChange },
      },
    );

    const thumb = getByTestId('thumb');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(valueChange).toHaveBeenCalledWith(6);
    expect(thumb).toHaveAttribute('aria-valuenow', '6');
  });

  it('should render vertical orientation styles', async () => {
    const { getByTestId } = await render(
      createTemplate(`[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="25"`),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { valueChange: jest.fn() },
      },
    );

    await Promise.resolve();

    const slider = getByTestId('slider');
    const range = getByTestId('range');
    const thumb = getByTestId('thumb');

    expect(slider).toHaveAttribute('data-orientation', 'vertical');
    expect(range.style.height).toBe('25%');
    expect(thumb.style.getPropertyValue('inset-block-start')).toBeDefined();
  });
});
