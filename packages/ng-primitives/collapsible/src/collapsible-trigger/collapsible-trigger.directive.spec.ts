import { render } from '@testing-library/angular';
import { NgpCollapsibleTriggerDirective } from './collapsible-trigger.directive';

describe('NgpCollapsibleTriggerDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCollapsibleTrigger></div>`, {
      imports: [NgpCollapsibleTriggerDirective],
    });
  });
});
