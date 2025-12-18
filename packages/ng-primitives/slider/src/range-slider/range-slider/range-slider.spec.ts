import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpRangeSliderRange } from '../range-slider-range/range-slider-range';
import { NgpRangeSliderThumb } from '../range-slider-thumb/range-slider-thumb';
import { NgpRangeSliderTrack } from '../range-slider-track/range-slider-track';
import { NgpRangeSlider } from './range-slider';

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
