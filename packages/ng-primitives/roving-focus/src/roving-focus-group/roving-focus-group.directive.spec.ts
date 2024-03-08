import { render } from '@testing-library/angular';
import { NgpRovingFocusGroupDirective } from './roving-focus-group.directive';

describe('NgpRovingFocusGroupDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpRovingFocusGroup></div>`, {
      imports: [NgpRovingFocusGroupDirective],
    });
  });
});
