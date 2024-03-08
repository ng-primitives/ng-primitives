import { render } from '@testing-library/angular';
import { NgpTabListDirective } from './tab-list.directive';

describe('NgpTabListDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTabList></div>`, {
      imports: [NgpTabListDirective],
    });
  });
});
