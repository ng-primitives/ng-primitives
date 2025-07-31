import { render } from '@testing-library/angular';
import { NgpPress } from './press';

describe('NgpPress', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpPress></div>`, {
      imports: [NgpPress],
    });
  });
});
