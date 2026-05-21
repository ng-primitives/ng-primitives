import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { NgpProgressIndicator } from '../progress-indicator/progress-indicator';
import { NgpProgressLabel } from '../progress-label/progress-label';
import { NgpProgress } from './progress';

describe('NgpProgress', () => {
  it('should set the aria attributes', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50">
        <label ngpProgressLabel data-testid="progress-label">Loading</label>
      </div>`,
      { imports: [NgpProgress, NgpProgressLabel] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('role')).toBe('progressbar');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuenow')).toBe('50');
    expect(progress.getAttribute('aria-valuetext')).toBe('50%');
    const label = container.getByTestId('progress-label');
    expect(label).toHaveAttribute('id');
    expect(progress.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('should set the data-progressing attribute when value is between min and max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50"></div>`,
      {
        imports: [NgpProgress],
      },
    );

    expect(container.getByTestId('progress')).toHaveAttribute('data-progressing');
  });

  it('should not set the data-progressing attribute when value is equal to max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    expect(container.getByTestId('progress')).not.toHaveAttribute('data-progressing');
  });

  it('should not set the data-progressing attribute when value is equal to min', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="0"></div>`,
      {
        imports: [NgpProgress],
      },
    );

    expect(container.getByTestId('progress')).not.toHaveAttribute('data-progressing');
  });

  it('should set the data-indeterminate attribute when value is null', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress [ngpProgressValue]="value"></div>`,
      {
        imports: [NgpProgress],
        componentProperties: {
          value: null,
        },
      },
    );

    expect(container.getByTestId('progress')).toHaveAttribute('data-indeterminate');
  });

  it('should set the data-complete attribute when value is equal to max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    expect(container.getByTestId('progress')).toHaveAttribute('data-complete');
  });

  it('should set the id attribute', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).toHaveAttribute('id');
    expect(progress.id).toMatch(/^ngp-progress-\d+$/);
  });

  describe('NgpProgressIndicator', () => {
    it('should set width based on progress percentage', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="50">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports: [NgpProgress, NgpProgressIndicator] },
      );

      expect(container.getByTestId('indicator').style.width).toBe('50%');
    });

    it('should set width to 0% when value is 0', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="0">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports: [NgpProgress, NgpProgressIndicator] },
      );

      expect(container.getByTestId('indicator').style.width).toBe('0%');
    });

    it('should set width to 100% when value equals max', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports: [NgpProgress, NgpProgressIndicator] },
      );

      expect(container.getByTestId('indicator').style.width).toBe('100%');
    });

    it('should handle custom min/max values', async () => {
      const container = await render(
        `<div ngpProgress ngpProgressValue="75" ngpProgressMin="50" ngpProgressMax="100">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        { imports: [NgpProgress, NgpProgressIndicator] },
      );

      expect(container.getByTestId('indicator').style.width).toBe('50%');
    });

    it('should update width dynamically when value changes', async () => {
      const container = await render(
        `<div ngpProgress [ngpProgressValue]="value">
          <div ngpProgressIndicator data-testid="indicator"></div>
        </div>`,
        {
          imports: [NgpProgress, NgpProgressIndicator],
          componentProperties: { value: 25 },
        },
      );

      const indicator = container.getByTestId('indicator');
      expect(indicator.style.width).toBe('25%');

      await container.rerender({ componentProperties: { value: 80 } });
      container.detectChanges();
      expect(indicator.style.width).toBe('80%');
    });
  });
});
