import { render } from '@testing-library/angular';
import { NgpMenuTrigger } from './menu-trigger';

describe('NgpMenuTrigger', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpMenuTrigger></div>`, {
      imports: [NgpMenuTrigger],
    });
  });
});
