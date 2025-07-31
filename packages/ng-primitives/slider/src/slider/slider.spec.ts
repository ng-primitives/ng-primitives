import { render } from '@testing-library/angular';
import { NgpSlider } from './slider';

describe('NgpSlider', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpSlider></div>`, {
      imports: [NgpSlider],
    });
  });
});
