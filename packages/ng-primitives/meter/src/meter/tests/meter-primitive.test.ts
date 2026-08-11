import { render } from '@testing-library/angular';
import {
  NgpMeter,
  NgpMeterIndicator,
  NgpMeterLabel,
  NgpMeterTrack,
  NgpMeterValue,
} from 'ng-primitives/meter';
import { describe, expect, it } from 'vitest';

describe('NgpMeter', () => {
  const imports = [NgpMeter, NgpMeterIndicator, NgpMeterLabel, NgpMeterTrack, NgpMeterValue];

  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeter data-testid="meter"></div>`, { imports });
    expect(container.getByTestId('meter')).toBeTruthy();
  });

  it('should set role="meter"', async () => {
    const container = await render(`<div ngpMeter data-testid="meter"></div>`, { imports });
    expect(container.getByTestId('meter')).toHaveAttribute('role', 'meter');
  });

  describe('ARIA attributes', () => {
    it('should set aria-valuemin from input (default 0)', async () => {
      const container = await render(`<div ngpMeter data-testid="meter"></div>`, { imports });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax from input (default 100)', async () => {
      const container = await render(`<div ngpMeter data-testid="meter"></div>`, { imports });
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuemax', '100');
    });

    it('should set aria-valuenow based on percentage', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" data-testid="meter"></div>`,
        {
          imports,
        },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '50');
    });

    it('should set aria-valuetext based on percentage', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" data-testid="meter"></div>`,
        {
          imports,
        },
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

    it('should expose the raw value via aria-valuenow, on the same scale as min/max', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="50" ngpMeterMin="0" ngpMeterMax="200" data-testid="meter"></div>`,
        { imports },
      );
      // aria-valuenow is the raw value, not a percentage, so it reads correctly
      // against aria-valuemin/aria-valuemax (ARIA meter pattern)
      const meter = container.getByTestId('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '50');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '200');
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

    it('should clear aria-labelledby when the label is removed', async () => {
      const container = await render(
        `<div ngpMeter data-testid="meter">
          @if (showLabel) {
            <label ngpMeterLabel id="my-label">CPU Usage</label>
          }
        </div>`,
        { imports, componentProperties: { showLabel: true } },
      );
      const meter = container.getByTestId('meter');
      expect(meter).toHaveAttribute('aria-labelledby', 'my-label');

      // Removing the label must not leave aria-labelledby pointing at a missing id.
      await container.rerender({ componentProperties: { showLabel: false } });
      container.detectChanges();
      expect(meter).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('aria-valuenow clamping', () => {
    it('should clamp aria-valuenow to min when value is below min', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="-10" ngpMeterMin="0" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp aria-valuenow to max when value is above max', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="150" ngpMeterMin="0" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '100');
    });

    it('should expose the raw mid-range value via aria-valuenow', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" ngpMeterMin="50" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuenow', '75');
    });
  });

  describe('aria-valuetext', () => {
    it('should default to the percentage within the [min, max] range', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" ngpMeterMin="50" ngpMeterMax="100" data-testid="meter"></div>`,
        { imports },
      );
      // (75 - 50) / (100 - 50) = 50%, consistent with the aria-valuenow scale
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuetext', '50%');
    });

    it('should support a legacy (value, max) custom valueLabel (backward compatible)', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" ngpMeterMin="0" ngpMeterMax="100" [ngpMeterValueLabel]="valueLabel" data-testid="meter"></div>`,
        {
          imports,
          componentProperties: {
            // the added `min` param is appended last, so the pre-existing
            // (value, max) signature keeps working unchanged
            valueLabel: (value: number, max: number) => `${value} of ${max}`,
          },
        },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuetext', '75 of 100');
    });

    it('should pass (value, max, min) to a custom valueLabel', async () => {
      const container = await render(
        `<div ngpMeter ngpMeterValue="75" ngpMeterMin="50" ngpMeterMax="100" [ngpMeterValueLabel]="valueLabel" data-testid="meter"></div>`,
        {
          imports,
          componentProperties: {
            valueLabel: (value: number, max: number, min: number) => `${value} in [${min}, ${max}]`,
          },
        },
      );
      expect(container.getByTestId('meter')).toHaveAttribute('aria-valuetext', '75 in [50, 100]');
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
      expect(container.getByTestId('indicator').style.width).toBe('50%');
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
