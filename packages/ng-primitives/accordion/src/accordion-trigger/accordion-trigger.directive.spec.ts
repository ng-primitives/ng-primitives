/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { render } from '@testing-library/angular';
import { NgpAccordionTrigger } from './accordion-trigger.directive';

describe('NgpAccordionTrigger', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAccordionTrigger></div>`, {
      imports: [NgpAccordionTrigger],
    });
  });
});
