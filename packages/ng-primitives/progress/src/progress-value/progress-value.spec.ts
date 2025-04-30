import { render } from '@testing-library/angular';
import { NgpProgressValue } from './progress-value';

describe('NgpProgressValue', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpProgressValue></div>`, {
      imports: [NgpProgressValue],
    });
  });
});
