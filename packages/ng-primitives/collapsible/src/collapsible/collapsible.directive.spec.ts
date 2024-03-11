import { render } from '@testing-library/angular';
import { NgpCollapsibleDirective } from './collapsible.directive';

describe('NgpCollapsibleDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCollapsible></div>`, {
      imports: [NgpCollapsibleDirective],
    });
  });
});
