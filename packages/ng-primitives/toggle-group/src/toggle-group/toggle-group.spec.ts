/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { NgpToggleGroupItem } from '../toggle-group-item/toggle-group-item';
import { NgpToggleGroup } from './toggle-group';

describe('NgpToggleGroup', () => {
  describe('Single', () => {
    it('should have the expected defaults', async () => {
      const { getByRole } = await render(
        `
        <div ngpToggleGroup>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const group = getByRole('group');
      expect(group.getAttribute('data-type')).toBe('single');
      expect(group.getAttribute('aria-orientation')).toBe('horizontal');
      expect(group.getAttribute('data-orientation')).toBe('horizontal');
    });
  });
});
