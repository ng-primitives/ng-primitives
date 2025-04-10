import { render } from '@testing-library/angular';
import { NgpTooltipTrigger } from './tooltip-trigger';

describe('NgpTooltipTrigger', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTooltipTrigger></div>`, {
      imports: [NgpTooltipTrigger],
    });
  });
});
