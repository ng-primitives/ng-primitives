import { render } from '@testing-library/angular';
import { NgpSlider } from './slider';

describe('NgpSlider', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSlider></div>`, {
      imports: [NgpSlider],
    });
  });
});
