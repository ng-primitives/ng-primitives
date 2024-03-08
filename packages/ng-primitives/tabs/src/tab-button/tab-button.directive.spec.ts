import { render } from '@testing-library/angular';
import { NgpTabButtonDirective } from './tab-button.directive';

describe('NgpTabButtonDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTabButton></div>`, {
      imports: [NgpTabButtonDirective],
    });
  });
});
