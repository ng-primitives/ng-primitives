import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpRangeSliderRange } from '../range-slider-range/range-slider-range';
import { NgpRangeSliderThumb } from '../range-slider-thumb/range-slider-thumb';
import { NgpRangeSliderTrack } from '../range-slider-track/range-slider-track';
import { NgpRangeSlider } from './range-slider';

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

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low"
      [ngpRangeSliderHigh]="high"
      [ngpRangeSliderMin]="min"
      [ngpRangeSliderMax]="max"
      [ngpRangeSliderStep]="step"
      [ngpRangeSliderOrientation]="orientation"
      [ngpRangeSliderDisabled]="disabled"
      (ngpRangeSliderLowChange)="onLowChange($event)"
      (ngpRangeSliderHighChange)="onHighChange($event)"
      ngpRangeSlider
      data-testid="range-slider"
    >
      <div ngpRangeSliderTrack data-testid="slider-track">
        <div ngpRangeSliderRange data-testid="slider-range"></div>
        <div ngpRangeSliderThumb data-testid="low-thumb"></div>
        <div ngpRangeSliderThumb data-testid="high-thumb"></div>
      </div>
    </div>
  `,
})
class TestComponent {
  low = 20;
  high = 80;
  min = 0;
  max = 100;
  step = 1;
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  disabled = false;

  onLowChange(value: number): void {
    this.low = value;
  }

  onHighChange(value: number): void {
    this.high = value;
  }
}

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low"
      [ngpRangeSliderHigh]="high"
      [ngpRangeSliderMin]="min"
      [ngpRangeSliderMax]="max"
      [ngpRangeSliderStep]="step"
      [ngpRangeSliderOrientation]="'vertical'"
      (ngpRangeSliderLowChange)="onLowChange($event)"
      (ngpRangeSliderHighChange)="onHighChange($event)"
      ngpRangeSlider
      data-testid="vertical-range-slider"
    >
      <div ngpRangeSliderTrack data-testid="vertical-slider-track">
        <div ngpRangeSliderRange data-testid="vertical-slider-range"></div>
        <div ngpRangeSliderThumb data-testid="vertical-low-thumb"></div>
        <div ngpRangeSliderThumb data-testid="vertical-high-thumb"></div>
      </div>
    </div>
  `,
})
class VerticalTestComponent {
  low = 30;
  high = 70;
  min = 0;
  max = 100;
  step = 5;

  onLowChange(value: number): void {
    this.low = value;
  }

  onHighChange(value: number): void {
    this.high = value;
  }
}

describe('NgpRangeSlider', () => {
  it('should initialize correctly with default values', async () => {
    await render(TestComponent);

    const rangeSlider = screen.getByTestId('range-slider');
    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');
    const track = screen.getByTestId('slider-track');
    const range = screen.getByTestId('slider-range');

    expect(rangeSlider).toBeInTheDocument();
    expect(lowThumb).toBeInTheDocument();
    expect(highThumb).toBeInTheDocument();
    expect(track).toBeInTheDocument();
    expect(range).toBeInTheDocument();
  });

  it('should have correct ARIA attributes on thumbs', async () => {
    await render(TestComponent);

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    expect(lowThumb).toHaveAttribute('role', 'slider');
    expect(lowThumb).toHaveAttribute('aria-valuemin', '0');
    expect(lowThumb).toHaveAttribute('aria-valuemax', '100');
    expect(lowThumb).toHaveAttribute('aria-valuenow', '20');
    expect(lowThumb).toHaveAttribute('aria-orientation', 'horizontal');
    expect(lowThumb).toHaveAttribute('tabindex', '0');

    expect(highThumb).toHaveAttribute('role', 'slider');
    expect(highThumb).toHaveAttribute('aria-valuenow', '80');
  });

  it('should respect disabled state', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.disabled = true;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    expect(lowThumb).toHaveAttribute('tabindex', '-1');
    expect(highThumb).toHaveAttribute('tabindex', '-1');
    expect(lowThumb).toHaveAttribute('data-disabled', '');
    expect(highThumb).toHaveAttribute('data-disabled', '');
  });

  it('should update low value and emit lowChange event', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');

    // Simulate keyboard interaction
    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');

    expect(component.low).toBe(21);
    expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
  });

  it('should update high value and emit highChange event', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const highThumb = screen.getByTestId('high-thumb');

    highThumb.focus();
    await userEvent.keyboard('{arrowleft}');

    expect(component.high).toBe(79);
    expect(highThumb).toHaveAttribute('aria-valuenow', '79');
  });

  it('should prevent low value from exceeding high value', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    // Set values close to each other
    component.low = 75;
    component.high = 80;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    // Try to move low thumb beyond high value
    for (let i = 0; i < 10; i++) {
      await userEvent.keyboard('{arrowright}');
    }

    expect(component.low).toBe(80); // Should be clamped to high value
  });

  it('should prevent high value from going below low value', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    // Set values close to each other
    component.low = 20;
    component.high = 25;
    fixture.detectChanges();

    const highThumb = screen.getByTestId('high-thumb');
    highThumb.focus();

    // Try to move high thumb below low value
    for (let i = 0; i < 10; i++) {
      await userEvent.keyboard('{arrowleft}');
    }

    expect(component.high).toBe(20); // Should be clamped to low value
  });

  it('should handle keyboard navigation with arrow keys', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    // Test all arrow keys
    await userEvent.keyboard('{arrowright}');
    expect(component.low).toBe(21);

    await userEvent.keyboard('{arrowleft}');
    expect(component.low).toBe(20);

    await userEvent.keyboard('{arrowup}');
    expect(component.low).toBe(21);

    await userEvent.keyboard('{arrowdown}');
    expect(component.low).toBe(20);
  });

  it('should handle Home and End keys', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    await userEvent.keyboard('{Home}');
    expect(component.low).toBe(0);

    await userEvent.keyboard('{End}');
    expect(component.low).toBe(component.high); // Should be clamped to high value
  });

  it('should handle Shift modifier for larger steps', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    await userEvent.keyboard('{Shift>}{arrowright}{/Shift}');
    expect(component.low).toBe(30); // 20 + (1 * 10)
  });

  it('should respect step value', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.step = 5;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    await userEvent.keyboard('{arrowright}');
    expect(component.low).toBe(25); // 20 + 5
  });

  it('should work with custom min/max values', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.min = 10;
    component.max = 90;
    component.low = 30;
    component.high = 60;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('aria-valuemin', '10');
    expect(lowThumb).toHaveAttribute('aria-valuemax', '90');
    expect(lowThumb).toHaveAttribute('aria-valuenow', '30');
  });

  it('should handle track clicks to move closest thumb', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const track = screen.getByTestId('slider-track');

    // Mock getBoundingClientRect for track
    const mockRect = { left: 0, top: 0, width: 100, height: 20 };
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    // Click near the beginning (should move low thumb)
    await userEvent.pointer({ keys: '[MouseLeft>]', target: track, coords: { x: 10, y: 10 } });

    expect(component.low).toBeLessThan(20);
  });

  it('should not respond to interactions when disabled', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.disabled = true;
    fixture.detectChanges();

    const initialLow = component.low;
    const lowThumb = screen.getByTestId('low-thumb');
    const track = screen.getByTestId('slider-track');

    // Mock getBoundingClientRect for track
    const mockRect = { left: 0, top: 0, width: 100, height: 20 };
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    // Try to interact with track (should not work when disabled)
    await userEvent.pointer({ keys: '[MouseLeft]', target: track, coords: { x: 10, y: 10 } });

    // Try to interact with thumb via pointer (should not work when disabled)
    await userEvent.pointer({ keys: '[MouseLeft>]', target: lowThumb });
    await userEvent.pointer({ coords: { x: 50, y: 10 } });
    await userEvent.pointer({ keys: '[/MouseLeft]' });

    // Values should remain unchanged
    expect(component.low).toBe(initialLow);
  });

  it('should respect min and max value', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.min = 10;
    component.max = 90;

    component.low = 20;
    component.high = 80;

    component.step = 10;

    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    lowThumb.focus();
    await userEvent.keyboard('{arrowleft}');
    await userEvent.keyboard('{arrowleft}');

    expect(component.low).toBe(10);

    highThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await userEvent.keyboard('{arrowright}');
    expect(component.high).toBe(90);
  });
});

describe('NgpRangeSlider Vertical Orientation', () => {
  it('should work correctly in vertical orientation', async () => {
    await render(VerticalTestComponent);

    const rangeSlider = screen.getByTestId('vertical-range-slider');
    const lowThumb = screen.getByTestId('vertical-low-thumb');
    const highThumb = screen.getByTestId('vertical-high-thumb');

    expect(rangeSlider).toHaveAttribute('data-orientation', 'vertical');
    expect(lowThumb).toHaveAttribute('aria-orientation', 'vertical');
    expect(highThumb).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should handle vertical keyboard navigation', async () => {
    const { fixture } = await render(VerticalTestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('vertical-low-thumb');
    lowThumb.focus();

    await userEvent.keyboard('{arrowup}');
    expect(component.low).toBe(35); // 30 + 5 (step)

    await userEvent.keyboard('{arrowdown}');
    expect(component.low).toBe(30);
  });

  it('should invert thumb positions for vertical orientation (higher value = lower inset)', async () => {
    await render(VerticalTestComponent);

    const lowThumb = screen.getByTestId('vertical-low-thumb');
    const highThumb = screen.getByTestId('vertical-high-thumb');

    // Low thumb at 30% value should have 70% inset-block-start (100 - 30 = 70)
    expect(lowThumb.style.getPropertyValue('inset-block-start')).toBe('70%');
    // High thumb at 70% value should have 30% inset-block-start (100 - 70 = 30)
    expect(highThumb.style.getPropertyValue('inset-block-start')).toBe('30%');
  });

  it('should position range correctly for vertical orientation', async () => {
    await render(VerticalTestComponent);

    const range = screen.getByTestId('vertical-slider-range');

    // Range should span from 30% to 70% = 40% height
    expect(range.style.height).toBe('40%');
    // inset-block-start should be 100 - highPercentage = 100 - 70 = 30%
    expect(range.style.getPropertyValue('inset-block-start')).toBe('30%');
  });

  it('should set higher value when clicking near top of vertical track', async () => {
    const { fixture } = await render(VerticalTestComponent);
    const component = fixture.componentInstance;

    const track = screen.getByTestId('vertical-slider-track');

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
    // This is closer to high thumb (70%), so it should move high thumb
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 10,
    });
    track.dispatchEvent(pointerEvent);

    expect(component.high).toBe(90);
  });

  it('should set lower value when clicking near bottom of vertical track', async () => {
    const { fixture } = await render(VerticalTestComponent);
    const component = fixture.componentInstance;

    const track = screen.getByTestId('vertical-slider-track');

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
    // This is closer to low thumb (30%), so it should move low thumb
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 10,
      clientY: 90,
    });
    track.dispatchEvent(pointerEvent);

    expect(component.low).toBe(10);
  });
});

describe('NgpRangeSliderThumb', () => {
  it('should identify thumbs correctly as low and high', async () => {
    await render(TestComponent);

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    expect(lowThumb).toHaveAttribute('data-thumb', 'low');
    expect(highThumb).toHaveAttribute('data-thumb', 'high');
  });

  it('should handle pointer events for dragging', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    const track = screen.getByTestId('slider-track');

    // Mock getBoundingClientRect for track
    const mockRect = { left: 0, top: 0, width: 100, height: 20 };
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    // Start drag
    await userEvent.pointer({ keys: '[MouseLeft>]', target: lowThumb });

    // Move pointer (this would normally update the value during drag)
    await userEvent.pointer({ coords: { x: 50, y: 10 } });

    // End drag
    await userEvent.pointer({ keys: '[/MouseLeft]' });

    // Value should have been updated during the drag operation
    expect(component.low).not.toBe(20);
  });
});

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low"
      [ngpRangeSliderHigh]="high"
      [ngpRangeSliderMin]="0"
      [ngpRangeSliderMax]="100"
      [ngpRangeSliderDisabled]="disabled"
      ngpRangeSlider
      data-testid="range-slider"
    >
      <div ngpRangeSliderTrack data-testid="slider-track">
        <div ngpRangeSliderRange data-testid="slider-range"></div>
        <div
          (ngpRangeSliderThumbDragStart)="onLowDragStart()"
          (ngpRangeSliderThumbDragEnd)="onLowDragEnd()"
          ngpRangeSliderThumb
          data-testid="low-thumb"
        ></div>
        <div
          (ngpRangeSliderThumbDragStart)="onHighDragStart()"
          (ngpRangeSliderThumbDragEnd)="onHighDragEnd()"
          ngpRangeSliderThumb
          data-testid="high-thumb"
        ></div>
      </div>
    </div>
  `,
})
class DragEventsTestComponent {
  low = 20;
  high = 80;
  disabled = false;

  lowDragStartCount = 0;
  lowDragEndCount = 0;
  highDragStartCount = 0;
  highDragEndCount = 0;

  onLowDragStart(): void {
    this.lowDragStartCount++;
  }

  onLowDragEnd(): void {
    this.lowDragEndCount++;
  }

  onHighDragStart(): void {
    this.highDragStartCount++;
  }

  onHighDragEnd(): void {
    this.highDragEndCount++;
  }
}

describe('NgpRangeSliderThumb Drag Events', () => {
  it('should emit dragStart when pointer down on low thumb', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');

    fireEvent.pointerDown(lowThumb);

    expect(component.lowDragStartCount).toBe(1);
    expect(component.lowDragEndCount).toBe(0);

    fireEvent.pointerUp(document);
  });

  it('should emit dragEnd when pointer up after pointer down on low thumb', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');

    fireEvent.pointerDown(lowThumb);
    expect(component.lowDragStartCount).toBe(1);

    fireEvent.pointerUp(document);
    expect(component.lowDragEndCount).toBe(1);
  });

  it('should emit dragStart when pointer down on high thumb', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const highThumb = screen.getByTestId('high-thumb');

    fireEvent.pointerDown(highThumb);

    expect(component.highDragStartCount).toBe(1);
    expect(component.highDragEndCount).toBe(0);

    fireEvent.pointerUp(document);
  });

  it('should emit dragEnd when pointer up after pointer down on high thumb', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const highThumb = screen.getByTestId('high-thumb');

    fireEvent.pointerDown(highThumb);
    expect(component.highDragStartCount).toBe(1);

    fireEvent.pointerUp(document);
    expect(component.highDragEndCount).toBe(1);
  });

  it('should not emit drag events when slider is disabled', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    component.disabled = true;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');

    fireEvent.pointerDown(lowThumb);
    fireEvent.pointerUp(document);

    expect(component.lowDragStartCount).toBe(0);
    expect(component.lowDragEndCount).toBe(0);
  });

  it('should emit events independently for each thumb', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    // Drag low thumb
    fireEvent.pointerDown(lowThumb);
    fireEvent.pointerUp(document);

    // Drag high thumb
    fireEvent.pointerDown(highThumb);
    fireEvent.pointerUp(document);

    expect(component.lowDragStartCount).toBe(1);
    expect(component.lowDragEndCount).toBe(1);
    expect(component.highDragStartCount).toBe(1);
    expect(component.highDragEndCount).toBe(1);
  });

  it('should ignore pointerup from a different pointer during drag', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');

    // Start drag with pointer ID 1
    lowThumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(component.lowDragStartCount).toBe(1);

    // Try to end drag with a different pointer ID - should be ignored
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 2 }),
    );
    expect(component.lowDragEndCount).toBe(0);

    // End drag with the correct pointer ID
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(component.lowDragEndCount).toBe(1);
  });

  it('should ignore pointercancel from a different pointer during drag', async () => {
    const { fixture } = await render(DragEventsTestComponent);
    const component = fixture.componentInstance;

    const highThumb = screen.getByTestId('high-thumb');

    // Start drag with pointer ID 1
    highThumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(component.highDragStartCount).toBe(1);

    // Try to cancel drag with a different pointer ID - should be ignored
    document.dispatchEvent(
      new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 2 }),
    );
    expect(component.highDragEndCount).toBe(0);

    // Cancel drag with the correct pointer ID
    document.dispatchEvent(
      new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
    expect(component.highDragEndCount).toBe(1);
  });

  it('should ignore pointermove from a different pointer during drag', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const lowThumb = screen.getByTestId('low-thumb');
    const track = screen.getByTestId('slider-track');

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
      toJSON: () => {},
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const initialLow = component.low;

    // Start drag with pointer ID 1
    lowThumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
    );

    // Move with the same pointer ID - should update value
    document.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        clientX: 50,
        clientY: 10,
      }),
    );
    const updatedLow = component.low;
    expect(updatedLow).not.toBe(initialLow);

    // Move with a different pointer ID - should be ignored (value unchanged)
    document.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        cancelable: true,
        pointerId: 2,
        clientX: 10,
        clientY: 10,
      }),
    );
    expect(component.low).toBe(updatedLow);

    // End drag with original pointer
    document.dispatchEvent(
      new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
    );
  });
});

describe('NgpRangeSliderTrack', () => {
  it('should have correct orientation attributes', async () => {
    await render(TestComponent);

    const track = screen.getByTestId('slider-track');
    expect(track).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should handle clicks to move thumbs', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const track = screen.getByTestId('slider-track');

    // Mock getBoundingClientRect
    const mockRect = { left: 0, top: 0, width: 100, height: 20 };
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect);

    const initialLow = component.low;
    const initialHigh = component.high;

    // Click on track
    await userEvent.pointer({ keys: '[MouseLeft]', target: track, coords: { x: 10, y: 10 } });

    // Either low or high should have changed
    expect(component.low !== initialLow || component.high !== initialHigh).toBe(true);
  });
});

describe('NgpRangeSliderRange', () => {
  it('should have correct orientation attributes', async () => {
    await render(TestComponent);

    const range = screen.getByTestId('slider-range');
    expect(range).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should update visual representation when values change', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const range = screen.getByTestId('slider-range');

    // Change values
    component.low = 10;
    component.high = 90;
    fixture.detectChanges();

    // Range should reflect the new values in its styling
    const computedStyle = getComputedStyle(range);
    expect(computedStyle.width).toBeTruthy();
  });
});

describe('NgpRangeSlider Edge Cases', () => {
  it('should handle equal low and high values', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.low = 50;
    component.high = 50;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    const highThumb = screen.getByTestId('high-thumb');

    expect(lowThumb).toHaveAttribute('aria-valuenow', '50');
    expect(highThumb).toHaveAttribute('aria-valuenow', '50');
  });

  it('should handle negative ranges', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.min = -50;
    component.max = 50;
    component.low = -20;
    component.high = 30;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('aria-valuemin', '-50');
    expect(lowThumb).toHaveAttribute('aria-valuemax', '50');
    expect(lowThumb).toHaveAttribute('aria-valuenow', '-20');
  });

  it('should handle decimal step values', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.step = 0.5;
    fixture.detectChanges();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();

    await userEvent.keyboard('{arrowright}');
    expect(component.low).toBe(20.5);
  });

  it('should respect step value when setting low value via pointer', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.low = 20;
    component.high = 80;
    component.step = 10;
    fixture.detectChanges();
    await fixture.whenStable();

    const track = screen.getByTestId('slider-track');

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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      toJSON: () => {},
    });

    // Click at 33% of the track (closer to low thumb at 20%)
    // should snap to 30 with step=10
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 33,
      clientY: 10,
    });
    track.dispatchEvent(pointerEvent);

    expect(component.low).toBe(30);
  });

  it('should respect step value when setting high value via pointer', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.low = 20;
    component.high = 80;
    component.step = 10;
    fixture.detectChanges();
    await fixture.whenStable();

    const track = screen.getByTestId('slider-track');

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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      toJSON: () => {},
    });

    // Click at 73% of the track (closer to high thumb at 80%)
    // should snap to 70 with step=10
    const pointerEvent = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      clientX: 73,
      clientY: 10,
    });
    track.dispatchEvent(pointerEvent);

    expect(component.high).toBe(70);
  });
});
