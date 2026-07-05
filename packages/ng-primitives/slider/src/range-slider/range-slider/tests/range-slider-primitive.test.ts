import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NgpRangeSliderRange } from '../../range-slider-range/range-slider-range';
import { NgpRangeSliderThumb } from '../../range-slider-thumb/range-slider-thumb';
import { NgpRangeSliderTrack } from '../../range-slider-track/range-slider-track';
import { NgpRangeSlider } from '../range-slider';

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      [ngpRangeSliderMin]="min()"
      [ngpRangeSliderMax]="max()"
      [ngpRangeSliderStep]="step()"
      [ngpRangeSliderOrientation]="orientation()"
      [ngpRangeSliderDisabled]="disabled()"
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
  readonly low = signal(20);
  readonly high = signal(80);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = signal(false);

  onLowChange(value: number): void {
    this.low.set(value);
  }

  onHighChange(value: number): void {
    this.high.set(value);
  }
}

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      [ngpRangeSliderMin]="min()"
      [ngpRangeSliderMax]="max()"
      [ngpRangeSliderStep]="step()"
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
  readonly low = signal(30);
  readonly high = signal(70);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(5);

  onLowChange(value: number): void {
    this.low.set(value);
  }

  onHighChange(value: number): void {
    this.high.set(value);
  }
}

@Component({
  imports: [NgpRangeSlider, NgpRangeSliderThumb, NgpRangeSliderTrack, NgpRangeSliderRange],
  template: `
    <div
      [ngpRangeSliderLow]="low()"
      [ngpRangeSliderHigh]="high()"
      [ngpRangeSliderMin]="0"
      [ngpRangeSliderMax]="100"
      [ngpRangeSliderDisabled]="disabled()"
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
  readonly low = signal(20);
  readonly high = signal(80);
  readonly disabled = signal(false);

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

const horizontalRect = {
  left: 0,
  top: 0,
  right: 100,
  bottom: 20,
  width: 100,
  height: 20,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

const verticalRect = {
  left: 0,
  top: 0,
  right: 20,
  bottom: 100,
  width: 20,
  height: 100,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

describe('NgpRangeSlider', () => {
  describe('roles & attributes', () => {
    it('should initialize correctly with default values', async () => {
      await render(TestComponent);

      expect(screen.getByTestId('range-slider')).toBeInTheDocument();
      expect(screen.getByTestId('low-thumb')).toBeInTheDocument();
      expect(screen.getByTestId('high-thumb')).toBeInTheDocument();
      expect(screen.getByTestId('slider-track')).toBeInTheDocument();
      expect(screen.getByTestId('slider-range')).toBeInTheDocument();
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
  });

  describe('value pair', () => {
    it('should update low value and emit lowChange event', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');

      lowThumb.focus();
      await userEvent.keyboard('{arrowright}');
      await fixture.whenStable();

      expect(component.low()).toBe(21);
      expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
    });

    it('should update high value and emit highChange event', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const highThumb = screen.getByTestId('high-thumb');

      highThumb.focus();
      await userEvent.keyboard('{arrowleft}');
      await fixture.whenStable();

      expect(component.high()).toBe(79);
      expect(highThumb).toHaveAttribute('aria-valuenow', '79');
    });

    it('should prevent low value from exceeding high value', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.low.set(75);
      component.high.set(80);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      for (let i = 0; i < 10; i++) {
        await userEvent.keyboard('{arrowright}');
      }

      expect(component.low()).toBe(80); // clamped to high value
    });

    it('should prevent high value from going below low value', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.low.set(20);
      component.high.set(25);
      fixture.detectChanges();
      await fixture.whenStable();

      const highThumb = screen.getByTestId('high-thumb');
      highThumb.focus();

      for (let i = 0; i < 10; i++) {
        await userEvent.keyboard('{arrowleft}');
      }

      expect(component.high()).toBe(20); // clamped to low value
    });

    it('should handle equal low and high values', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.low.set(50);
      component.high.set(50);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '50');
      expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('keyboard', () => {
    it('should handle navigation with arrow keys', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{arrowright}');
      expect(component.low()).toBe(21);

      await userEvent.keyboard('{arrowleft}');
      expect(component.low()).toBe(20);

      await userEvent.keyboard('{arrowup}');
      expect(component.low()).toBe(21);

      await userEvent.keyboard('{arrowdown}');
      expect(component.low()).toBe(20);
    });

    it('should handle Home and End keys', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{Home}');
      expect(component.low()).toBe(0);

      await userEvent.keyboard('{End}');
      expect(component.low()).toBe(component.high()); // clamped to high value
    });

    describe('RTL', () => {
      async function renderRtl() {
        const view = await render(TestComponent);
        // apply RTL to the slider so getComputedStyle().direction resolves to 'rtl'
        screen.getByTestId('range-slider').setAttribute('dir', 'rtl');
        const component = view.fixture.componentInstance;
        screen.getByTestId('low-thumb').focus();
        return { component };
      }

      it('should increase the value on ArrowLeft in RTL', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{arrowleft}');
        expect(component.low()).toBe(21);
      });

      it('should decrease the value on ArrowRight in RTL', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{arrowright}');
        expect(component.low()).toBe(19);
      });

      it('should increase the value on ArrowUp regardless of RTL', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{arrowup}');
        expect(component.low()).toBe(21);
      });

      it('should decrease the value on ArrowDown regardless of RTL', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{arrowdown}');
        expect(component.low()).toBe(19);
      });

      it('should move to the minimum on Home regardless of RTL', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{Home}');
        expect(component.low()).toBe(0);
      });

      it('should move to the maximum on End regardless of RTL (clamped to high)', async () => {
        const { component } = await renderRtl();
        await userEvent.keyboard('{End}');
        expect(component.low()).toBe(component.high());
      });
    });

    it('should handle Shift modifier for larger steps', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{Shift>}{arrowright}{/Shift}');
      expect(component.low()).toBe(30); // 20 + (1 * 10)
    });
  });

  describe('min/max/step', () => {
    it('should respect step value', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.step.set(5);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{arrowright}');
      expect(component.low()).toBe(25); // 20 + 5
    });

    it('should work with custom min/max values', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.min.set(10);
      component.max.set(90);
      component.low.set(30);
      component.high.set(60);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      expect(lowThumb).toHaveAttribute('aria-valuemin', '10');
      expect(lowThumb).toHaveAttribute('aria-valuemax', '90');
      expect(lowThumb).toHaveAttribute('aria-valuenow', '30');
    });

    it('should respect min and max value while stepping', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.min.set(10);
      component.max.set(90);
      component.low.set(20);
      component.high.set(80);
      component.step.set(10);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      const highThumb = screen.getByTestId('high-thumb');

      lowThumb.focus();
      await userEvent.keyboard('{arrowleft}');
      await userEvent.keyboard('{arrowleft}');
      expect(component.low()).toBe(10);

      highThumb.focus();
      await userEvent.keyboard('{arrowright}');
      await userEvent.keyboard('{arrowright}');
      expect(component.high()).toBe(90);
    });

    it('should handle negative ranges', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.min.set(-50);
      component.max.set(50);
      component.low.set(-20);
      component.high.set(30);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      expect(lowThumb).toHaveAttribute('aria-valuemin', '-50');
      expect(lowThumb).toHaveAttribute('aria-valuemax', '50');
      expect(lowThumb).toHaveAttribute('aria-valuenow', '-20');
    });

    it('should handle decimal step values', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.step.set(0.5);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{arrowright}');
      expect(component.low()).toBe(20.5);
    });
  });

  describe('orientation', () => {
    it('should reflect horizontal orientation attributes', async () => {
      await render(TestComponent);

      expect(screen.getByTestId('slider-track')).toHaveAttribute('data-orientation', 'horizontal');
      expect(screen.getByTestId('slider-range')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should work correctly in vertical orientation', async () => {
      await render(VerticalTestComponent);

      expect(screen.getByTestId('vertical-range-slider')).toHaveAttribute(
        'data-orientation',
        'vertical',
      );
      expect(screen.getByTestId('vertical-low-thumb')).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
      expect(screen.getByTestId('vertical-high-thumb')).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
    });

    it('should handle vertical keyboard navigation', async () => {
      const { fixture } = await render(VerticalTestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('vertical-low-thumb');
      lowThumb.focus();

      await userEvent.keyboard('{arrowup}');
      expect(component.low()).toBe(35); // 30 + 5 (step)

      await userEvent.keyboard('{arrowdown}');
      expect(component.low()).toBe(30);
    });

    it('should invert thumb positions for vertical orientation (higher value = lower inset)', async () => {
      await render(VerticalTestComponent);

      const lowThumb = screen.getByTestId('vertical-low-thumb');
      const highThumb = screen.getByTestId('vertical-high-thumb');

      // Low thumb at 30% value should have 70% inset-block-start (100 - 30)
      expect(lowThumb.style.getPropertyValue('inset-block-start')).toBe('70%');
      // High thumb at 70% value should have 30% inset-block-start (100 - 70)
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
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(verticalRect);

      fixture.detectChanges();
      await fixture.whenStable();

      // Click near the top (y=10 of 100 = 10% from top = 90% value) - nearest high thumb (70%)
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        }),
      );

      expect(component.high()).toBe(90);
    });

    it('should set lower value when clicking near bottom of vertical track', async () => {
      const { fixture } = await render(VerticalTestComponent);
      const component = fixture.componentInstance;

      const track = screen.getByTestId('vertical-slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(verticalRect);

      fixture.detectChanges();
      await fixture.whenStable();

      // Click near the bottom (y=90 of 100 = 90% from top = 10% value) - nearest low thumb (30%)
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 90,
        }),
      );

      expect(component.low()).toBe(10);
    });
  });

  describe('disabled', () => {
    it('should respect disabled state', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.disabled.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumb = screen.getByTestId('low-thumb');
      const highThumb = screen.getByTestId('high-thumb');

      expect(lowThumb).toHaveAttribute('tabindex', '-1');
      expect(highThumb).toHaveAttribute('tabindex', '-1');
      expect(lowThumb).toHaveAttribute('data-disabled', '');
      expect(highThumb).toHaveAttribute('data-disabled', '');
    });

    it('should not respond to interactions when disabled', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.disabled.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const initialLow = component.low();
      const lowThumb = screen.getByTestId('low-thumb');
      const track = screen.getByTestId('slider-track');

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      await userEvent.pointer({ keys: '[MouseLeft]', target: track, coords: { x: 10, y: 10 } });
      await userEvent.pointer({ keys: '[MouseLeft>]', target: lowThumb });
      await userEvent.pointer({ coords: { x: 50, y: 10 } });
      await userEvent.pointer({ keys: '[/MouseLeft]' });

      expect(component.low()).toBe(initialLow);
    });

    it('should not focus thumb when clicking the track while disabled', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.disabled.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        }),
      );

      expect(focusViaSpy).not.toHaveBeenCalled();
    });
  });

  describe('track', () => {
    it('should have correct orientation attributes', async () => {
      await render(TestComponent);

      expect(screen.getByTestId('slider-track')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should handle track clicks to move closest thumb', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      // Click near the beginning (should move low thumb)
      await userEvent.pointer({ keys: '[MouseLeft>]', target: track, coords: { x: 10, y: 10 } });

      expect(component.low()).toBeLessThan(20);
    });

    it('should move either thumb when clicking the track', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      const initialLow = component.low();
      const initialHigh = component.high();

      await userEvent.pointer({ keys: '[MouseLeft]', target: track, coords: { x: 10, y: 10 } });

      expect(component.low() !== initialLow || component.high() !== initialHigh).toBe(true);
    });

    it('should focus the closest thumb with mouse origin when clicking the track', async () => {
      const { fixture } = await render(TestComponent);

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      fixture.detectChanges();
      await fixture.whenStable();

      const lowThumbEl = screen.getByTestId('low-thumb');
      const highThumbEl = screen.getByTestId('high-thumb');

      // Click near 10% (closer to low thumb at 20%)
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        }),
      );

      expect(focusViaSpy).toHaveBeenCalledWith(
        expect.objectContaining({ nativeElement: lowThumbEl }),
        'mouse',
        { preventScroll: true },
      );

      focusViaSpy.mockClear();

      // Click near 90% (closer to high thumb at 80%)
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 90,
          clientY: 10,
        }),
      );

      expect(focusViaSpy).toHaveBeenCalledWith(
        expect.objectContaining({ nativeElement: highThumbEl }),
        'mouse',
        { preventScroll: true },
      );
    });

    it('should use touch focus origin when track is tapped', async () => {
      const { fixture } = await render(TestComponent);

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const track = screen.getByTestId('slider-track');
      const lowThumbEl = screen.getByTestId('low-thumb');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      fixture.detectChanges();
      await fixture.whenStable();

      track.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 10,
          clientY: 10,
          pointerType: 'touch',
        }),
      );

      expect(focusViaSpy).toHaveBeenCalledWith(
        expect.objectContaining({ nativeElement: lowThumbEl }),
        'touch',
        { preventScroll: true },
      );
    });

    it('should prevent mousedown default to preserve thumb focus after track click', async () => {
      const { fixture } = await render(TestComponent);

      const track = screen.getByTestId('slider-track');

      fixture.detectChanges();
      await fixture.whenStable();

      // In real browsers, mousedown fires after pointerdown and its default
      // action steals focus from the thumb. The track must prevent it.
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      track.dispatchEvent(mousedownEvent);

      expect(mousedownEvent.defaultPrevented).toBe(true);
    });

    it('should respect step value when setting low value via pointer', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.low.set(20);
      component.high.set(80);
      component.step.set(10);
      fixture.detectChanges();
      await fixture.whenStable();

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      // Click at 33% (closer to low thumb at 20%) - snaps to 30 with step=10
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 33,
          clientY: 10,
        }),
      );

      expect(component.low()).toBe(30);
    });

    it('should respect step value when setting high value via pointer', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      component.low.set(20);
      component.high.set(80);
      component.step.set(10);
      fixture.detectChanges();
      await fixture.whenStable();

      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      // Click at 73% (closer to high thumb at 80%) - snaps to 70 with step=10
      track.dispatchEvent(
        new MouseEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: 73,
          clientY: 10,
        }),
      );

      expect(component.high()).toBe(70);
    });
  });

  describe('range', () => {
    it('should have correct orientation attributes', async () => {
      await render(TestComponent);

      expect(screen.getByTestId('slider-range')).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should update visual representation when values change', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const range = screen.getByTestId('slider-range');

      component.low.set(10);
      component.high.set(90);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(getComputedStyle(range).width).toBeTruthy();
    });
  });

  describe('thumbs', () => {
    it('should identify thumbs correctly as low and high', async () => {
      await render(TestComponent);

      expect(screen.getByTestId('low-thumb')).toHaveAttribute('data-thumb', 'low');
      expect(screen.getByTestId('high-thumb')).toHaveAttribute('data-thumb', 'high');
    });

    it('should handle pointer events for dragging', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');
      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      await userEvent.pointer({ keys: '[MouseLeft>]', target: lowThumb });
      await userEvent.pointer({ coords: { x: 50, y: 10 } });
      await userEvent.pointer({ keys: '[/MouseLeft]' });

      expect(component.low()).not.toBe(20);
    });

    it('should ignore pointermove from a different pointer during drag', async () => {
      const { fixture } = await render(TestComponent);
      const component = fixture.componentInstance;

      const lowThumb = screen.getByTestId('low-thumb');
      const track = screen.getByTestId('slider-track');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(horizontalRect);

      fixture.detectChanges();
      await fixture.whenStable();

      const initialLow = component.low();

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
      const updatedLow = component.low();
      expect(updatedLow).not.toBe(initialLow);

      // Move with a different pointer ID - should be ignored
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          pointerId: 2,
          clientX: 10,
          clientY: 10,
        }),
      );
      expect(component.low()).toBe(updatedLow);

      document.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
      );
    });
  });

  describe('thumb drag events', () => {
    it('should emit dragStart when pointer down on low thumb', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      fireEvent.pointerDown(screen.getByTestId('low-thumb'));

      expect(component.lowDragStartCount).toBe(1);
      expect(component.lowDragEndCount).toBe(0);

      fireEvent.pointerUp(document);
    });

    it('should emit dragEnd when pointer up after pointer down on low thumb', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      fireEvent.pointerDown(screen.getByTestId('low-thumb'));
      expect(component.lowDragStartCount).toBe(1);

      fireEvent.pointerUp(document);
      expect(component.lowDragEndCount).toBe(1);
    });

    it('should emit dragStart when pointer down on high thumb', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      fireEvent.pointerDown(screen.getByTestId('high-thumb'));

      expect(component.highDragStartCount).toBe(1);
      expect(component.highDragEndCount).toBe(0);

      fireEvent.pointerUp(document);
    });

    it('should emit dragEnd when pointer up after pointer down on high thumb', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      fireEvent.pointerDown(screen.getByTestId('high-thumb'));
      expect(component.highDragStartCount).toBe(1);

      fireEvent.pointerUp(document);
      expect(component.highDragEndCount).toBe(1);
    });

    it('should not emit drag events when slider is disabled', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      component.disabled.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      fireEvent.pointerDown(screen.getByTestId('low-thumb'));
      fireEvent.pointerUp(document);

      expect(component.lowDragStartCount).toBe(0);
      expect(component.lowDragEndCount).toBe(0);
    });

    it('should emit events independently for each thumb', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      fireEvent.pointerDown(screen.getByTestId('low-thumb'));
      fireEvent.pointerUp(document);

      fireEvent.pointerDown(screen.getByTestId('high-thumb'));
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

      lowThumb.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
      );
      expect(component.lowDragStartCount).toBe(1);

      document.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 2 }),
      );
      expect(component.lowDragEndCount).toBe(0);

      document.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 1 }),
      );
      expect(component.lowDragEndCount).toBe(1);
    });

    it('should ignore pointercancel from a different pointer during drag', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      const highThumb = screen.getByTestId('high-thumb');

      highThumb.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 }),
      );
      expect(component.highDragStartCount).toBe(1);

      document.dispatchEvent(
        new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 2 }),
      );
      expect(component.highDragEndCount).toBe(0);

      document.dispatchEvent(
        new PointerEvent('pointercancel', { bubbles: true, cancelable: true, pointerId: 1 }),
      );
      expect(component.highDragEndCount).toBe(1);
    });

    it('should focus the low thumb with mouse origin on pointerdown', async () => {
      await render(DragEventsTestComponent);

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const lowThumb = screen.getByTestId('low-thumb');

      lowThumb.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

      expect(focusViaSpy).toHaveBeenCalledWith(
        expect.objectContaining({ nativeElement: lowThumb }),
        'mouse',
        { preventScroll: true },
      );

      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    });

    it('should focus the high thumb with mouse origin on pointerdown', async () => {
      await render(DragEventsTestComponent);

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const highThumb = screen.getByTestId('high-thumb');

      highThumb.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

      expect(focusViaSpy).toHaveBeenCalledWith(
        expect.objectContaining({ nativeElement: highThumb }),
        'mouse',
        { preventScroll: true },
      );

      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    });

    it('should not focus the thumb on pointerdown when disabled', async () => {
      const { fixture } = await render(DragEventsTestComponent);
      const component = fixture.componentInstance;

      component.disabled.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const focusMonitor = TestBed.inject(FocusMonitor);
      const focusViaSpy = vi.spyOn(focusMonitor, 'focusVia');

      const lowThumb = screen.getByTestId('low-thumb');

      lowThumb.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

      expect(focusViaSpy).not.toHaveBeenCalled();
    });
  });
});
