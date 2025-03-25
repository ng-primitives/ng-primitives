/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { NgpSwitch } from './switch';

describe('NgpSwitch', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSwitch></div>`, {
      imports: [NgpSwitch],
    });
  });
});
