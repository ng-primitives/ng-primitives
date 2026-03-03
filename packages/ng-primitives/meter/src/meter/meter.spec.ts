import { render } from '@testing-library/angular';
import { NgpMeterIndicator } from '../meter-indicator/meter-indicator';
import { NgpMeterLabel } from '../meter-label/meter-label';
import { NgpMeterTrack } from '../meter-track/meter-track';
import { NgpMeterValue } from '../meter-value/meter-value';
import { NgpMeter } from './meter';

describe('NgpMeter', () => {
  const imports = [NgpMeter, NgpMeterIndicator, NgpMeterLabel, NgpMeterTrack, NgpMeterValue];

  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeter data-testid="meter"></div>`, {
      imports,
    });
    expect(container.getByTestId('meter')).toBeTruthy();
  });

  it('should set role="meter"', async () => {
    const container = await render(`<div ngpMeter data-testid="meter"></div>`, {
      imports,
    });
    expect(container.getByTestId('meter')).toHaveAttribute('role', 'meter');
  });

  describe('ARIA attributes', () => {
    it('should set aria-valuemin from input (default 0)', async () => {
      const container = await render(`<div ngpMeter data-testid="meter"></div>`, {
        imports,
      });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax from input (default 100)', async () => {
      const container = await render(`<div ngpMeter data-testid="meter"></div>`, {
        imports,
      });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemax', '100');
    });

    it('should set aria-valuenow based on percentage', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '50');
    });

    it('should set aria-valuetext based on percentage', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuetext', '50%');
    });

    it('should set custom aria-valuemin', async () => {
      const container = await render(`<div ngpMeter ngpMeterMin="10" data-testid="meter"></div>`, {
        imports,
      });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemin', '10');
    });

    it('should set custom aria-valuemax', async () => {
      const container = await render(`<div ngpMeter ngpMeterMax="200" data-testid="meter"></div>`, {
        imports,
      });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemax', '200');
    });

    it('should calculate aria-valuenow as percentage with custom min/max', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" ngpMeterMin="0" ngpMeterMax="200" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '25');
    });

    it('should set aria-labelledby when label is present', async () => {
      const container = await render(
        `<div ngpMeter data-testid="meter">
          <label ngpMeterLabel id="my-label">CPU Usage</label>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-labelledby', 'my-label');
    });

    it('should use auto-generated label id when no id is provided', async () => {
      const container = await render(
        `<div ngpMeter data-testid="meter">
          <label ngpMeterLabel data-testid="label">CPU Usage</label>
        </div>`,
        { imports },
      );
      const label = container.getByTestId('label');
      const labelId = label.getAttribute('id');
      expect(labelId).toMatch(/^ngp-meter-label-/);
      expect(container.getByTestId('meter')).toHaveAttribute('aria-labelledby', labelId);
    });
  });

  describe('percentage calculation', () => {
    it('should clamp to 0 when value is below min', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="-10" ngpMeterMin="0" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp to 100 when value is above max', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="150" ngpMeterMin="0" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '100');
    });

    it('should calculate correct percentage for mid-range values', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" ngpMeterMin="50" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('custom valueLabel', () => {
    it('should use custom valueLabel function for aria-valuetext', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" [ngpMeterValueLabel]="valueLabel" data-testid="meter"></div>`,
        {
          imports,
          componentProperties: {
            valueLabel: (value: number, max: number) => `${value} of ${max}`,
          },
        },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuetext', '75 of 100');
    });
  });

  describe('dynamic updates', () => {
    it('should update ARIA values when value changes', async () => {
      const container = await render(
        `<div ngpMeter [ngpMeterValue]="value" data-testid="meter"></div>`,
        {
          imports,
          componentProperties: { value: 25 },
        },
      );
      const meter = container.getByTestId('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '25');
      expect(meter).toHaveAttribute('aria-valuetext', '25%');

      await container.rerender({ componentProperties: { value: 75 } });
      container.detectChanges();
      expect(meter).toHaveAttribute('aria-valuenow', '75');
      expect(meter).toHaveAttribute('aria-valuetext', '75%');
    });
  });

  describe('NgpMeterIndicator', () => {
    it('should set width style based on percentage', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50">
          <div ngpMeterTrack>
            <div ngpMeterIndicator data-testid="indicator"></div>
          </div>
        </div>`,
        { imports },
      );
      const indicator = container.getByTestId('indicator');
      expect(indicator.style.width).toBe('50%');
    });

    it('should update width when value changes', async () => {
      const container = await render(
        `<div ngpMeter [ngpMeterValue]="value">
          <div ngpMeterTrack>
            <div ngpMeterIndicator data-testid="indicator"></div>
          </div>
        </div>`,
        {
          imports,
          componentProperties: { value: 25 },
        },
      );
      const indicator = container.getByTestId('indicator');
      expect(indicator.style.width).toBe('25%');

      await container.rerender({ componentProperties: { value: 80 } });
      container.detectChanges();
      expect(indicator.style.width).toBe('80%');
    });

    it('should set width to 0% when value is 0', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="0">
          <div ngpMeterTrack>
            <div ngpMeterIndicator data-testid="indicator"></div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('0%');
    });

    it('should set width to 100% when value equals max', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="100">
          <div ngpMeterTrack>
            <div ngpMeterIndicator data-testid="indicator"></div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('100%');
    });
  });

  describe('NgpMeterLabel', () => {
    it('should render label with id', async () => {
      const container = await render(
        `<div ngpMeter>
          <label ngpMeterLabel data-testid="label">CPU Usage</label>
        </div>`,
        { imports },
      );
      const label = container.getByTestId('label');
      expect(label).toHaveAttribute('id');
      expect(label.textContent).toContain('CPU Usage');
    });
  });

  describe('NgpMeterValue', () => {
    it('should set aria-hidden="true"', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50">
          <span ngpMeterValue data-testid="value">50%</span>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('value')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('NgpMeterTrack', () => {
    it('should render as a container element', async () => {
      const container = await render(
        `<div ngpMeter>
          <div ngpMeterTrack data-testid="track">
            <div ngpMeterIndicator></div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('track')).toBeTruthy();
    });
  });
});
