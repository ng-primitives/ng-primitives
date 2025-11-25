import { render } from '@testing-library/angular';
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
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).toHaveAttribute('data-progressing');
  });

  it('should not set the data-progressing attribute when value is equal to max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).not.toHaveAttribute('data-progressing');
  });

  it('should not set the data-progressing attribute when value is equal to min', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="0"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).not.toHaveAttribute('data-progressing');
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

    const progress = container.getByTestId('progress');
    expect(progress).toHaveAttribute('data-indeterminate');
  });

  it('should set the data-complete attribute when value is equal to max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).toHaveAttribute('data-complete');
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
});
