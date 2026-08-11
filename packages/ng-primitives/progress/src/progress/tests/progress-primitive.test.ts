import { render } from '@testing-library/angular';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressLabel,
  NgpProgressTrack,
  NgpProgressValue,
} from 'ng-primitives/progress';
import { describe, expect, it } from 'vitest';

describe('NgpProgress', () => {
  const imports = [
    NgpProgress,
    NgpProgressIndicator,
    NgpProgressLabel,
    NgpProgressTrack,
    NgpProgressValue,
  ];

  describe('roles & attributes', () => {
    it('should initialise correctly', async () => {
      const container = await render(`<div ngpProgress data-testid="progress"></div>`, { imports });
      expect(container.getByTestId('progress')).toBeTruthy();
    });

    it('should set role="progressbar"', async () => {
      const container = await render(`<div ngpProgress data-testid="progress"></div>`, { imports });
      expect(container.getByTestId('progress')).toHaveAttribute('role', 'progressbar');
    });

    it('should set an auto-generated id', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="100" data-testid="progress"></div>`,
        { imports },
      );
      const progress = container.getByTestId('progress');
      expect(progress).toHaveAttribute('id');
      expect(progress.id).toMatch(/^ngp-progress-\d+$/);
    });

    it('should use a custom id when provided', async () => {
      const container = await render(
        `<div ngpProgress id="my-progress" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('id', 'my-progress');
    });
  });

  describe('value & max state', () => {
    it('should set data-progressing when value is between min and max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('data-progressing');
    });

    it('should not set data-progressing when value equals max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="100" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('data-progressing');
    });

    it('should not set data-progressing when value equals min', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="0" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('data-progressing');
    });

    it('should set data-complete when value equals max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="100" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('data-complete');
    });

    it('should not set data-complete when value is below max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('data-complete');
    });

    it('should not be progressing at a non-zero min start value', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" ngpProgressMin="50" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      // at the start of the range the progress has not started, regardless of min
      expect(container.getByTestId('progress')).not.toHaveAttribute('data-progressing');
    });

    it('should be complete (consistent with aria) for a value above max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="150" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      const progress = container.getByTestId('progress');
      expect(progress).toHaveAttribute('data-complete');
      expect(progress).not.toHaveAttribute('data-progressing');
      expect(progress).toHaveAttribute('aria-valuenow', '100');
    });

    it('should clamp the indicator width to 100% when value is above max', async () => {
      const { getByTestId } = await render(
        `<div ngpProgress ngpProgressValue="150" ngpProgressMax="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect((getByTestId('indicator') as HTMLElement).style.width).toBe('100%');
    });

    it('should not produce a NaN width for a zero-length range (min === max)', async () => {
      const { getByTestId } = await render(
        `<div ngpProgress ngpProgressValue="100" ngpProgressMin="100" ngpProgressMax="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect((getByTestId('indicator') as HTMLElement).style.width).toBe('100%');
    });

    it('should clamp the indicator width to 0% when value is below min', async () => {
      const { getByTestId } = await render(
        `<div ngpProgress ngpProgressValue="-10" ngpProgressMin="0" ngpProgressMax="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect((getByTestId('indicator') as HTMLElement).style.width).toBe('0%');
    });
  });

  describe('ARIA value attributes', () => {
    it('should set aria-valuemin from the default min (0)', async () => {
      const container = await render(`<div ngpProgress data-testid="progress"></div>`, { imports });
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax from the default max (100)', async () => {
      const container = await render(`<div ngpProgress data-testid="progress"></div>`, { imports });
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuemax', '100');
    });

    it('should reflect a custom min via aria-valuemin', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressMin="10" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuemin', '10');
    });

    it('should reflect a custom max via aria-valuemax', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressMax="200" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuemax', '200');
    });

    it('should expose the raw value via aria-valuenow (not a percentage)', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuenow', '50');
    });

    it('should keep aria-valuenow on the same scale as aria-valuemin/aria-valuemax', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" ngpProgressMin="0" ngpProgressMax="200" data-testid="progress"></div>`,
        { imports },
      );
      // aria-valuenow is the raw value, not a 0-100 percentage, so it reads correctly
      // against aria-valuemin/aria-valuemax (ARIA progressbar pattern).
      const progress = container.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '200');
    });

    it('should expose the raw mid-range value via aria-valuenow with a custom min', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="50" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuenow', '75');
    });

    it('should clamp aria-valuenow to min when value is below min', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="-10" ngpProgressMin="0" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuenow', '0');
    });

    it('should clamp aria-valuenow to max when value is above max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="150" ngpProgressMin="0" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('aria-valuetext', () => {
    it('should default to the percentage within [min, max]', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuetext', '50%');
    });

    it('should compute the default percentage relative to a custom min/max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="50" ngpProgressMax="100" data-testid="progress"></div>`,
        { imports },
      );
      // (75 - 50) / (100 - 50) = 50%, consistent with the aria-valuenow scale.
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuetext', '50%');
    });

    it('should support a legacy (value, max) custom valueLabel (backward compatible)', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="0" ngpProgressMax="100" [ngpProgressValueLabel]="valueLabel" data-testid="progress"></div>`,
        {
          imports,
          componentProperties: {
            // the added `min` param is appended last, so the pre-existing
            // (value, max) signature keeps working unchanged
            valueLabel: (value: number, max: number) => `${value} of ${max}`,
          },
        },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('aria-valuetext', '75 of 100');
    });

    it('should pass (value, max, min) to a custom valueLabel', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="50" ngpProgressMax="100" [ngpProgressValueLabel]="valueLabel" data-testid="progress"></div>`,
        {
          imports,
          componentProperties: {
            valueLabel: (value: number, max: number, min: number) => `${value} in [${min}, ${max}]`,
          },
        },
      );
      expect(container.getByTestId('progress')).toHaveAttribute(
        'aria-valuetext',
        '75 in [50, 100]',
      );
    });
  });

  describe('indeterminate state', () => {
    it('should set data-indeterminate when value is null', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value" data-testid="progress"></div>`,
        { imports, componentProperties: { value: null } },
      );
      expect(container.getByTestId('progress')).toHaveAttribute('data-indeterminate');
    });

    it('should omit aria-valuenow when indeterminate', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value" data-testid="progress"></div>`,
        { imports, componentProperties: { value: null } },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('aria-valuenow');
    });

    it('should omit aria-valuetext when indeterminate', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value" data-testid="progress"></div>`,
        { imports, componentProperties: { value: null } },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('aria-valuetext');
    });

    it('should restore aria-valuenow when a value is set again', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value" data-testid="progress"></div>`,
        { imports, componentProperties: { value: null } },
      );
      const progress = container.getByTestId('progress');
      expect(progress).not.toHaveAttribute('aria-valuenow');

      await container.rerender({ componentProperties: { value: 40 } });
      container.detectChanges();
      expect(progress).toHaveAttribute('aria-valuenow', '40');
    });
  });

  describe('dynamic updates', () => {
    it('should update ARIA values when the value changes', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value" data-testid="progress"></div>`,
        { imports, componentProperties: { value: 25 } },
      );
      const progress = container.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-valuenow', '25');
      expect(progress).toHaveAttribute('aria-valuetext', '25%');

      await container.rerender({ componentProperties: { value: 75 } });
      container.detectChanges();
      expect(progress).toHaveAttribute('aria-valuenow', '75');
      expect(progress).toHaveAttribute('aria-valuetext', '75%');
    });
  });

  describe('NgpProgressIndicator width', () => {
    it('should set width based on the progress percentage', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('50%');
    });

    it('should set width to 0% when value is 0', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="0">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('0%');
    });

    it('should set width to 100% when value equals max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('100%');
    });

    it('should compute width against custom min/max values', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="50" ngpProgressMax="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('indicator').style.width).toBe('50%');
    });

    it('should update width dynamically when value changes', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports, componentProperties: { value: 25 } },
      );
      const indicator = container.getByTestId('indicator');
      expect(indicator.style.width).toBe('25%');

      await container.rerender({ componentProperties: { value: 80 } });
      container.detectChanges();
      expect(indicator.style.width).toBe('80%');
    });
  });

  describe('label wiring', () => {
    it('should associate the label via aria-labelledby', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress">
          <label ngpProgressLabel data-testid="label">Loading</label>
        </div>`,
        { imports },
      );
      const label = container.getByTestId('label');
      expect(label).toHaveAttribute('id');
      expect(container.getByTestId('progress')).toHaveAttribute('aria-labelledby', label.id);
    });

    it('should not set aria-labelledby when no label is present', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress"></div>`,
        { imports },
      );
      expect(container.getByTestId('progress')).not.toHaveAttribute('aria-labelledby');
    });

    it('should clear aria-labelledby when the label is removed', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50" data-testid="progress">
          @if (showLabel) {
            <label ngpProgressLabel id="my-label">Loading</label>
          }
        </div>`,
        { imports, componentProperties: { showLabel: true } },
      );
      const progress = container.getByTestId('progress');
      expect(progress).toHaveAttribute('aria-labelledby', 'my-label');

      // Removing the label must not leave aria-labelledby pointing at a missing id.
      await container.rerender({ componentProperties: { showLabel: false } });
      container.detectChanges();
      expect(progress).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('NgpProgressValue', () => {
    it('should set aria-hidden="true"', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50">
          <span ngpProgressValue data-testid="value">50%</span>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('value')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('NgpProgressTrack', () => {
    it('should render as a container element', async () => {
      const container = await render(
        `<div ngpProgress>
          <div ngpProgressTrack data-testid="track">
            <div ngpProgressIndicator></div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('track')).toBeTruthy();
    });
  });
});
