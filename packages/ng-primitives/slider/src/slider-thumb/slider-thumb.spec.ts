import { fireEvent, render } from '@testing-library/angular';
import { NgpSliderRange } from '../slider-range/slider-range';
import { NgpSliderTrack } from '../slider-track/slider-track';
import { NgpSlider } from '../slider/slider';
import { NgpSliderThumb } from './slider-thumb';

// Polyfill PointerEvent for jsdom
class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;

  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 0;
  }
}

if (typeof globalThis.PointerEvent === 'undefined') {
  (globalThis as unknown as { PointerEvent: typeof MockPointerEvent }).PointerEvent =
    MockPointerEvent;
}

describe('NgpSliderThumb', () => {
  function createTemplate(extraProps = ''): string {
    return `
      <div
        ngpSlider
        data-testid="slider"
        [ngpSliderValue]="value"
        [ngpSliderMin]="0"
        [ngpSliderMax]="100"
        ${extraProps}>
        <div ngpSliderTrack data-testid="track"></div>
        <div ngpSliderRange data-testid="range"></div>
        <div
          ngpSliderThumb
          data-testid="thumb"
          (ngpSliderThumbDragStart)="onDragStart()"
          (ngpSliderThumbDragEnd)="onDragEnd()">
        </div>
      </div>
    `;
  }

  it('should emit dragStart when pointer down on thumb', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    fireEvent.pointerDown(thumb);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('should emit dragEnd when pointer up after pointer down', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    fireEvent.pointerDown(thumb);
    expect(onDragStart).toHaveBeenCalledTimes(1);

    fireEvent.pointerUp(document);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should emit dragEnd when pointer cancel after pointer down', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    fireEvent.pointerDown(thumb);
    expect(onDragStart).toHaveBeenCalledTimes(1);

    fireEvent.pointerCancel(document);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should not emit dragStart when slider is disabled', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(`[ngpSliderDisabled]="true"`), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    fireEvent.pointerDown(thumb);

    expect(onDragStart).not.toHaveBeenCalled();
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('should emit both events during a complete drag operation', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId, fixture } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');
    const track = getByTestId('track');

    // Mock track dimensions
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fixture.detectChanges();
    await fixture.whenStable();

    // Start drag
    fireEvent.pointerDown(thumb);
    expect(onDragStart).toHaveBeenCalledTimes(1);

    // Move pointer (simulating drag)
    fireEvent.pointerMove(document, { clientX: 75, clientY: 10 });

    // End drag
    fireEvent.pointerUp(document);
    expect(onDragEnd).toHaveBeenCalledTimes(1);

    // Verify each event was called exactly once
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should ignore pointermove from a different pointer during drag', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId, fixture } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');
    const track = getByTestId('track');

    // Mock track dimensions
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fixture.detectChanges();
    await fixture.whenStable();

    // Start drag with pointer ID 1
    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragStart).toHaveBeenCalledTimes(1);

    // Move with the same pointer ID - should update value
    document.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 75,
        clientY: 10,
      }),
    );

    // Move with a different pointer ID - should be ignored
    document.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        pointerId: 2,
        clientX: 25,
        clientY: 10,
      }),
    );

    // End drag with original pointer
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should ignore pointerup from a different pointer during drag', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    // Start drag with pointer ID 1
    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragStart).toHaveBeenCalledTimes(1);

    // Try to end drag with a different pointer ID - should be ignored
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 2 }),
    );
    expect(onDragEnd).not.toHaveBeenCalled();

    // End drag with the correct pointer ID
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should ignore pointercancel from a different pointer during drag', async () => {
    const onDragStart = jest.fn();
    const onDragEnd = jest.fn();

    const { getByTestId } = await render(createTemplate(), {
      imports: [NgpSlider, NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
      componentProperties: { value: 50, onDragStart, onDragEnd },
    });

    const thumb = getByTestId('thumb');

    // Start drag with pointer ID 1
    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragStart).toHaveBeenCalledTimes(1);

    // Try to cancel drag with a different pointer ID - should be ignored
    document.dispatchEvent(
      new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 2 }),
    );
    expect(onDragEnd).not.toHaveBeenCalled();

    // Cancel drag with the correct pointer ID
    document.dispatchEvent(
      new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
