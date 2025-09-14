import { render } from '@testing-library/angular';
import { NgpAutoScroll } from './auto-scroll';

describe('NgpAutoScroll', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAutoScroll></div>`, {
      imports: [NgpAutoScroll],
    });
  });
});
