import { render } from '@testing-library/angular';
import { NgpTabset } from './tabset';

describe('NgpTabset', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTabset></div>`, {
      imports: [NgpTabset],
    });
  });
});
