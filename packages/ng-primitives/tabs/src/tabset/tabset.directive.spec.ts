import { render } from '@testing-library/angular';
import { NgpTabsetDirective } from './tabset.directive';

describe('NgpTabsetDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTabset></div>`, {
      imports: [NgpTabsetDirective],
    });
  });
});
