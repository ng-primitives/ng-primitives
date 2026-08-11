import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RangeSlider } from './range-slider-forms.fixture';

describe('RangeSlider (reusable component) — standalone', () => {
  it('renders two thumbs with the slider role and initial values', async () => {
    const { fixture } = await render(
      `<app-range-slider [low]="20" [high]="80" [min]="0" [max]="100"></app-range-slider>`,
      { imports: [RangeSlider] },
    );
    await fixture.whenStable();

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('data-thumb', 'low');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('data-thumb', 'high');
    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-valuenow', '80');
  });

  it('reflects custom min/max on the thumbs', async () => {
    const { fixture } = await render(
      `<app-range-slider [low]="30" [high]="60" [min]="10" [max]="90"></app-range-slider>`,
      { imports: [RangeSlider] },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('aria-valuemin', '10');
    expect(lowThumb).toHaveAttribute('aria-valuemax', '90');
    expect(lowThumb).toHaveAttribute('aria-valuenow', '30');
  });

  it('updates the low thumb value with the keyboard', async () => {
    // low/high are controlled inputs, so two-way bindings round-trip the change.
    const { fixture } = await render(
      `<app-range-slider [(low)]="low" [(high)]="high" [min]="0" [max]="100" [step]="1"></app-range-slider>`,
      { imports: [RangeSlider], componentProperties: { low: 20, high: 80 } },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    expect(lowThumb).toHaveAttribute('aria-valuenow', '21');
  });

  it('clamps the low thumb so it cannot cross the high thumb', async () => {
    const { fixture } = await render(
      `<app-range-slider [(low)]="low" [(high)]="high" [min]="0" [max]="100" [step]="1"></app-range-slider>`,
      { imports: [RangeSlider], componentProperties: { low: 20, high: 80 } },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    lowThumb.focus();
    await userEvent.keyboard('{End}');
    await fixture.whenStable();

    // End tries to jump to max but the low thumb is clamped to the high value
    expect(lowThumb).toHaveAttribute('aria-valuenow', '80');
  });

  it('marks the thumbs disabled and removes them from the tab order when disabled', async () => {
    const { fixture } = await render(
      `<app-range-slider [low]="20" [high]="80" [min]="0" [max]="100" disabled="true"></app-range-slider>`,
      { imports: [RangeSlider] },
    );
    await fixture.whenStable();

    const lowThumb = screen.getByTestId('low-thumb');
    expect(lowThumb).toHaveAttribute('tabindex', '-1');
    expect(lowThumb).toHaveAttribute('data-disabled', '');

    lowThumb.focus();
    await userEvent.keyboard('{arrowright}');
    await fixture.whenStable();

    // a disabled slider must not change value from keyboard input
    expect(lowThumb).toHaveAttribute('aria-valuenow', '20');
  });

  it('supports vertical orientation', async () => {
    const { fixture } = await render(
      `<app-range-slider [low]="30" [high]="70" orientation="vertical"></app-range-slider>`,
      { imports: [RangeSlider] },
    );
    await fixture.whenStable();

    expect(screen.getByTestId('low-thumb')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByTestId('high-thumb')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
