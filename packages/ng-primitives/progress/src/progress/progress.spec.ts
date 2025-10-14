import { render } from '@testing-library/angular';
import { NgpProgressLabel } from '../progress-label/progress-label';
import { NgpProgress } from './progress';

describe('NgpProgress', () => {
  it('should set the aria attributes', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('role')).toBe('progressbar');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuenow')).toBe('50');
    expect(progress.getAttribute('aria-valuetext')).toBe('50%');
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

  it('should not have aria-labelledby when no label is present', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress).not.toHaveAttribute('aria-labelledby');
  });

  it('should set aria-labelledby when NgpProgressLabel is present', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50">
        <span ngpProgressLabel data-testid="label" id="custom-label">Loading...</span>
      </div>`,
      { imports: [NgpProgress, NgpProgressLabel] },
    );

    const progress = container.getByTestId('progress');
    const label = container.getByTestId('label');

    expect(progress).toHaveAttribute('aria-labelledby', label.id);
    expect(label.id).toBe('custom-label');
  });

  it('should generate unique id for NgpProgressLabel and associate it with progress', async () => {
    const container = await render(
      `<div ngpProgress ngpProgressValue="50" data-testid="progress">
        <span ngpProgressLabel data-testid="label">Loading...</span>
      </div>`,
      { imports: [NgpProgress, NgpProgressLabel] },
    );

    const progress = container.getByTestId('progress');
    const label = container.getByTestId('label');

    expect(progress).toHaveAttribute('aria-labelledby', label.id);
    expect(label.id).toMatch(/^ngp-progress-label-\d+$/);
  });

  it('should update aria-labelledby when label id changes', async () => {
    const { getByTestId, rerender } = await render(
      `<div ngpProgress ngpProgressValue="50" data-testid="progress">
        <span ngpProgressLabel data-testid="label" [id]="labelId">Loading...</span>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressLabel],
        componentProperties: { labelId: 'initial-label' },
      },
    );

    const progress = getByTestId('progress');
    const label = getByTestId('label');

    expect(progress).toHaveAttribute('aria-labelledby', 'initial-label');
    expect(label.id).toBe('initial-label');

    await rerender({ componentProperties: { labelId: 'updated-label' } });

    expect(progress).toHaveAttribute('aria-labelledby', 'updated-label');
    expect(label.id).toBe('updated-label');
  });
});
