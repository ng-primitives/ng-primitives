import { render } from '@testing-library/angular';
import { NgpToolbar } from './toolbar';

describe('NgpToolbar', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpToolbar></div>`, {
      imports: [NgpToolbar],
    });
  });
});
