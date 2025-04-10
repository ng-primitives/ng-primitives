import { render } from '@testing-library/angular';
import { NgpRovingFocusGroup } from './roving-focus-group';

describe('NgpRovingFocusGroup', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpRovingFocusGroup></div>`, {
      imports: [NgpRovingFocusGroup],
    });
  });
});
