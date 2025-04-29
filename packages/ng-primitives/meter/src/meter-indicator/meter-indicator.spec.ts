import { render } from '@testing-library/angular';
import { NgpMeterIndicator } from './meter-indicator';

describe('NgpMeterIndicator', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeterIndicator></div>`, {
      imports: [NgpMeterIndicator],
    });
  });
});
