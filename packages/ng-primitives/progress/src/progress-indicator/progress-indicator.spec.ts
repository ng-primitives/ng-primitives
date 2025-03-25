/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { NgpProgress } from '../progress/progress';
import { NgpProgressIndicator } from './progress-indicator';

describe('NgpProgressIndicator', () => {
  it('should set the data-state attribute when the value is between min and max', async () => {
    const container = await render(
      `<div ngpProgress>
        <div data-testid="indicator" ngpProgressIndicator></div>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressIndicator],
      },
    );

    const indicator = container.getByTestId('indicator');
    expect(indicator.getAttribute('data-state')).toBe('loading');
  });

  it('should set the data-state attribute when the value is equal to max', async () => {
    const container = await render(
      `<div ngpProgress [ngpProgressValue]="value">
        <div data-testid="indicator" ngpProgressIndicator></div>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressIndicator],
        componentProperties: {
          value: 100,
        },
      },
    );

    const indicator = container.getByTestId('indicator');
    expect(indicator.getAttribute('data-state')).toBe('complete');
  });

  it('should set the data-value attribute', async () => {
    const container = await render(
      `<div ngpProgress [ngpProgressValue]="value">
        <div data-testid="indicator" ngpProgressIndicator></div>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressIndicator],
        componentProperties: {
          value: 50,
        },
      },
    );

    const indicator = container.getByTestId('indicator');
    expect(indicator.getAttribute('data-value')).toBe('50');
  });

  it('should set the data-max attribute', async () => {
    const container = await render(
      `<div ngpProgress [ngpProgressMax]="max">
        <div data-testid="indicator" ngpProgressIndicator></div>
      </div>`,
      {
        imports: [NgpProgress, NgpProgressIndicator],
        componentProperties: {
          max: 200,
        },
      },
    );

    const indicator = container.getByTestId('indicator');
    expect(indicator.getAttribute('data-max')).toBe('200');
  });
});
