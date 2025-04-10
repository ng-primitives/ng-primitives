import { render } from '@testing-library/angular';
import { NgpMove } from './move';

describe('NgpMove', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMove></div>`, {
      imports: [NgpMove],
    });
  });
});
