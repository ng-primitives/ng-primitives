import { render } from '@testing-library/angular';
import { NgpLabel } from './label';

describe('NgpLabel', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpLabel></div>`, {
      imports: [NgpLabel],
    });
  });
});
