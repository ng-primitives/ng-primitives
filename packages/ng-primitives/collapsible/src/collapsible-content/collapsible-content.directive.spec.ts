import { render } from '@testing-library/angular';
import { NgpCollapsibleContentDirective } from './collapsible-content.directive';

describe('NgpCollapsibleContentDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCollapsibleContent></div>`, {
      imports: [NgpCollapsibleContentDirective],
    });
  });
});
