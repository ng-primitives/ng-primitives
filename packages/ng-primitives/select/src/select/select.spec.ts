import { render } from '@testing-library/angular';
import { NgpSelect } from './select';

describe('NgpSelect', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSelect></div>`, {
      imports: [NgpSelect],
    });
  });
});
