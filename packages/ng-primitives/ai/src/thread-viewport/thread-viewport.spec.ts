import { render } from '@testing-library/angular';
import { NgpThreadViewport } from './thread-viewport';

describe('NgpThreadViewport', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpThreadViewport></div>`, {
      imports: [NgpThreadViewport],
    });
  });
});
