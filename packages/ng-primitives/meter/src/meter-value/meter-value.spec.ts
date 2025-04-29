import { render } from '@testing-library/angular';
import { NgpMeterValue } from './meter-value';

describe('NgpMeterValue', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeterValue></div>`, {
      imports: [NgpMeterValue],
    });
  });
});
