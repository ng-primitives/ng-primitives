import { render } from '@testing-library/angular';
import { NgpSwitch } from './switch';

describe('NgpSwitch', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpSwitch></div>`, {
      imports: [NgpSwitch],
    });
  });
});
