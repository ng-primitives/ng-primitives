import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Slider } from './slider-forms.fixture';

describe('Slider (reusable component) — standalone', () => {
  it('renders a thumb with the correct slider ARIA', async () => {
    const { getByRole } = await render(`<app-slider value="40" min="0" max="100"></app-slider>`, {
      imports: [Slider],
    });
    const thumb = getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(thumb).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('forwards aria-label onto the thumb', async () => {
    const { getByRole } = await render(`<app-slider aria-label="Volume"></app-slider>`, {
      imports: [Slider],
    });
    expect(getByRole('slider')).toHaveAttribute('aria-label', 'Volume');
  });

  it('increments the value with the ArrowRight key', async () => {
    // `value` is the controlled input, so a two-way binding round-trips the change.
    const { getByRole, fixture } = await render(
      `<app-slider [(value)]="value" min="0" max="100" step="5"></app-slider>`,
      { imports: [Slider], componentProperties: { value: 40 } },
    );
    const thumb = getByRole('slider');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(thumb).toHaveAttribute('aria-valuenow', '45');
  });

  it('does not change the value with the keyboard when disabled', async () => {
    const { getByRole, fixture } = await render(
      `<app-slider value="40" min="0" max="100" disabled="true"></app-slider>`,
      { imports: [Slider] },
    );
    const thumb = getByRole('slider');
    expect(thumb).toHaveAttribute('data-disabled', '');
    expect(thumb).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    await fixture.whenStable();
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
  });
});
