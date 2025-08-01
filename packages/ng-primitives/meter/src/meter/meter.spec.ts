import { render } from '@testing-library/angular';
import { NgpMeter } from './meter';

describe('NgpMeter', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpMeter></div>`, {
      imports: [NgpMeter],
    });
  });
});
