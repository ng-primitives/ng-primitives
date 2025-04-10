import { render } from '@testing-library/angular';
import { NgpMenuTrigger } from './menu-trigger';

describe('NgpMenuTrigger', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMenuTrigger></div>`, {
      imports: [NgpMenuTrigger],
    });
  });
});
