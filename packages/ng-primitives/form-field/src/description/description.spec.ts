import { render } from '@testing-library/angular';
import { NgpDescription } from './description';

describe('NgpDescription', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpDescription></div>`, {
      imports: [NgpDescription],
    });
  });
});
