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
});
