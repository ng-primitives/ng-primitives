import { render } from '@testing-library/angular';
import { NgpPress } from './press';

describe('NgpPress', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPress></div>`, {
      imports: [NgpPress],
    });
  });
});
