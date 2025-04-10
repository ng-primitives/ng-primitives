import { render } from '@testing-library/angular';
import { NgpSwitch } from './switch';

describe('NgpSwitch', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSwitch></div>`, {
      imports: [NgpSwitch],
    });
  });
});
