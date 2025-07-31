import { render } from '@testing-library/angular';
import { NgpDescription } from './description';

describe('NgpDescription', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpDescription></div>`, {
      imports: [NgpDescription],
    });
  });
});
