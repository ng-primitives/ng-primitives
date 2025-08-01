import { render } from '@testing-library/angular';
import { NgpMove } from './move';

describe('NgpMove', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpMove></div>`, {
      imports: [NgpMove],
    });
  });
});
