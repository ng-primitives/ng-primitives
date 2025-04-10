import { render } from '@testing-library/angular';
import { NgpLabel } from './label';

describe('NgpLabel', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpLabel></div>`, {
      imports: [NgpLabel],
    });
  });
});
