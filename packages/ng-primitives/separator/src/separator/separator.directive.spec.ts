/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { provideSeparatorConfig } from '../config/separator.config';
import { NgpSeparator } from './separator.directive';

describe('NgpSeparator', () => {
  it('should create a default separator', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
    });

    const separator = container.getByRole('separator');
    expect(separator).toBeTruthy();
  });

  it('should set the orientation to horizontal by default', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
    });

    const separator = container.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const container = await render(
      `<div ngpSeparator [ngpSeparatorOrientation]="'vertical'"></div>`,
      {
        imports: [NgpSeparator],
      },
    );

    const separator = container.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.getAttribute('data-orientation')).toBe('vertical');
  });

  it('should set the orientation to horizontal', async () => {
    const container = await render(
      `<div ngpSeparator ngpSeparatorOrientation="horizontal"></div>`,
      {
        imports: [NgpSeparator],
      },
    );

    const separator = container.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('should allow the global orientation to be set', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
      providers: [provideSeparatorConfig({ orientation: 'vertical' })],
    });

    const separator = container.getByRole('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(separator.getAttribute('data-orientation')).toBe('vertical');
  });
});
