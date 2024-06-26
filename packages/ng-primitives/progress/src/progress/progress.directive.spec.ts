/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { NgpProgress } from './progress.directive';

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

  it('should set the data-state attribute when value is between min and max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('data-state')).toBe('loading');
  });

  it('should set the data-state attribute when value is equal to max', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="100"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('data-state')).toBe('complete');
  });

  it('should set the data-value attribute', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressValue="50"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('data-value')).toBe('50');
  });

  it('should set the data-max attribute', async () => {
    const container = await render(
      `<div data-testid="progress" ngpProgress ngpProgressMax="200"></div>`,
      { imports: [NgpProgress] },
    );

    const progress = container.getByTestId('progress');
    expect(progress.getAttribute('data-max')).toBe('200');
  });
});
