import { render } from '@testing-library/angular';
import { NgpRovingFocusItemDirective } from './roving-focus-item.directive';

describe('NgpRovingFocusItemDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpRovingFocusItem></div>`, {
      imports: [NgpRovingFocusItemDirective],
    });
  });
});
