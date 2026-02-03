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

  it('should invert thumb position for vertical orientation (higher value = lower inset)', async () => {
    const { getByTestId } = await render(
      createTemplate(
        `[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="75" [ngpSliderMin]="0" [ngpSliderMax]="100"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { valueChange: jest.fn() },
      },
    );

    await Promise.resolve();

    const thumb = getByTestId('thumb');
    // 75% value should have 25% inset-block-start (100 - 75 = 25)
    expect(thumb.style.getPropertyValue('inset-block-start')).toBe('25%');
  });

  it('should position thumb at top (0% inset) for max value in vertical orientation', async () => {
    const { getByTestId } = await render(
      createTemplate(
        `[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="100" [ngpSliderMin]="0" [ngpSliderMax]="100"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { valueChange: jest.fn() },
      },
    );

    await Promise.resolve();

    const thumb = getByTestId('thumb');
    expect(thumb.style.getPropertyValue('inset-block-start')).toBe('0%');
  });

  it('should position thumb at bottom (100% inset) for min value in vertical orientation', async () => {
    const { getByTestId } = await render(
      createTemplate(
        `[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="0" [ngpSliderMin]="0" [ngpSliderMax]="100"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { valueChange: jest.fn() },
      },
    );

    await Promise.resolve();

    const thumb = getByTestId('thumb');
    expect(thumb.style.getPropertyValue('inset-block-start')).toBe('100%');
  });

  it('should anchor range at bottom with inset-block-end and correct height for vertical orientation', async () => {
    const { getByTestId } = await render(
      createTemplate(`[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="50"`),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { valueChange: jest.fn() },
      },
    );

    await Promise.resolve();

    const range = getByTestId('range');
    expect(range.style.getPropertyValue('inset-block-end')).toBe('0%');
    expect(range.style.height).toBe('50%');
  });

  it('should set higher value when clicking near top of vertical track', async () => {
    const valueChange = jest.fn();
    const { getByTestId, fixture } = await render(
      createTemplate(
        `[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="50" [ngpSliderMin]="0" [ngpSliderMax]="100"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { value: 50, valueChange },
      },
    );

    const track = getByTestId('track');

    // Mock getBoundingClientRect for vertical track
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 20,
      bottom: 100,
      width: 20,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fixture.detectChanges();
    await fixture.whenStable();

    // Click near the top (y=10 out of 100 height = 10% from top = 90% value)
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 10,
    });
    track.dispatchEvent(pointerEvent);

    expect(valueChange).toHaveBeenCalledWith(90);
  });

  it('should set lower value when clicking near bottom of vertical track', async () => {
    const valueChange = jest.fn();
    const { getByTestId, fixture } = await render(
      createTemplate(
        `[ngpSliderOrientation]="'vertical'" [ngpSliderValue]="50" [ngpSliderMin]="0" [ngpSliderMax]="100"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { value: 50, valueChange },
      },
    );

    const track = getByTestId('track');

    // Mock getBoundingClientRect for vertical track
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 20,
      bottom: 100,
      width: 20,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fixture.detectChanges();
    await fixture.whenStable();

    // Click near the bottom (y=90 out of 100 height = 90% from top = 10% value)
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 90,
    });
    track.dispatchEvent(pointerEvent);

    expect(valueChange).toHaveBeenCalledWith(10);
  });

  it('should respect step value when adjusting with keyboard', async () => {
    const valueChange = jest.fn();
    const { getByTestId } = await render(
      createTemplate(
        `[ngpSliderValue]="value" [ngpSliderMin]="0" [ngpSliderMax]="10" [ngpSliderStep]="2"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { value: 4, valueChange },
      },
    );

    const thumb = getByTestId('thumb');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(valueChange).toHaveBeenCalledWith(6);
    expect(thumb).toHaveAttribute('aria-valuenow', '6');

    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(valueChange).toHaveBeenCalledWith(4);
    expect(thumb).toHaveAttribute('aria-valuenow', '4');
  });

  it('should respect step value when setting value via pointer', async () => {
    const valueChange = jest.fn();
    const { getByTestId, fixture } = await render(
      createTemplate(
        `[ngpSliderValue]="value" [ngpSliderMin]="0" [ngpSliderMax]="100" [ngpSliderStep]="10"`,
      ),
      {
        imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
        componentProperties: { value: 50, valueChange },
      },
    );

    const track = getByTestId('track');

    // Mock getBoundingClientRect to return realistic dimensions
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
       
      toJSON: () => {},
    });

    // Wait for change detection to complete
    fixture.detectChanges();
    await fixture.whenStable();

    // Create and dispatch a MouseEvent (jsdom doesn't have PointerEvent)
    // at 73% of the track (should snap to 70)
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 73,
      clientY: 10,
    });
    track.dispatchEvent(pointerEvent);

    expect(valueChange).toHaveBeenCalledWith(70);
  });
});
