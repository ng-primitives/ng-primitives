import { render } from '@testing-library/angular';
import { NgpMeterLabel } from './meter-label';

describe('NgpMeterLabel', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeterLabel></div>`, {
      imports: [NgpMeterLabel],
    });
  });
});
