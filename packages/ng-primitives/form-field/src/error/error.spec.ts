import { render } from '@testing-library/angular';
import { NgpError } from './error';

describe('NgpError', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpError></div>`, {
      imports: [NgpError],
    });
  });
});
