import { render } from '@testing-library/angular';
import { NgpProgress } from '../progress/progress';
import { NgpProgressLabel } from './progress-label';

describe('NgpProgressLabel', () => {
  it('should set the id attribute', async () => {
    const { getByTestId } = await render(
      `<div ngpProgress ngpProgressValue="50">
        <label ngpProgressLabel data-testid="progress-label">Label</label>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressLabel],
      },
    );

    const label = getByTestId('progress-label');
    expect(label).toHaveAttribute('id');
    expect(label.id).toMatch(/^ngp-progress-label-\d+$/);
  });

  it('should set the for attribute to the progress id when directive is applied to label', async () => {
    const { getByTestId } = await render(
      `<div ngpProgress data-testid="progress" ngpProgressValue="50">
        <label ngpProgressLabel data-testid="progress-label">Label</label>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressLabel],
      },
    );

    const progress = getByTestId('progress');
    expect(progress).toHaveAttribute('id');
    const label = getByTestId('progress-label') as HTMLLabelElement;
    expect(label).toHaveAttribute('id');
    expect(label.htmlFor).toMatch(progress.id);
  });

  it('should not set for attribute when directive is not applied to label', async () => {
    const { getByTestId } = await render(
      `<div ngpProgress  ngpProgressValue="50">
        <span ngpProgressLabel data-testid="progress-label">Label</span>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressLabel],
      },
    );

    const label = getByTestId('progress-label') as HTMLElement;
    expect(label).not.toHaveAttribute('for');
  });
});
