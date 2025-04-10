import { render } from '@testing-library/angular';
import { NgpPopoverTrigger } from './popover-trigger';

describe('NgpPopoverTrigger', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPopoverTrigger></div>`, {
      imports: [NgpPopoverTrigger],
    });
  });
});
