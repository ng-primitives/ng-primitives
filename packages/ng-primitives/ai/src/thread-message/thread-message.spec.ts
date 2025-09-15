import { render } from '@testing-library/angular';
import { NgpThreadMessage } from './thread-message';

describe('NgpThreadMessage', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpThreadMessage></div>`, {
      imports: [NgpThreadMessage],
    });
  });
});
