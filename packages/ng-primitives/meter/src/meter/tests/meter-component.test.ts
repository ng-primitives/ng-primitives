import { render } from '@testing-library/angular';
import { MeterFixture } from './meter-forms.fixture';

describe('Meter (reusable component) — standalone', () => {
  it('renders the label and value text', async () => {
    const { getByText } = await render(`<app-meter label="Label" value="40"></app-meter>`, {
      imports: [MeterFixture],
    });
    expect(getByText('Label')).toBeVisible();
    expect(getByText('40%')).toBeVisible();
  });

  it('applies correct ARIA attributes', async () => {
    const { getByRole } = await render(`<app-meter label="Label" value="40"></app-meter>`, {
      imports: [MeterFixture],
    });
    const meter = getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '40');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-valuetext', '40%');
  });

  it('sets the indicator width based on value', async () => {
    const { container } = await render(`<app-meter label="Label" value="40"></app-meter>`, {
      imports: [MeterFixture],
    });
    const indicator = container.querySelector('[ngpMeterIndicator]') as HTMLElement;
    expect(indicator.style.width).toBe('40%');
  });

  it('updates the indicator width when value changes', async () => {
    const { container, rerender } = await render(
      `<app-meter label="Label" [value]="value"></app-meter>`,
      { imports: [MeterFixture], componentProperties: { value: 40 } },
    );
    const indicator = container.querySelector('[ngpMeterIndicator]') as HTMLElement;
    expect(indicator.style.width).toBe('40%');
    await rerender({ componentProperties: { value: 75 } });
    expect(indicator.style.width).toBe('75%');
  });
});
