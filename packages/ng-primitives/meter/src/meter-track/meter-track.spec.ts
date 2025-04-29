import { render } from '@testing-library/angular';
import { NgpMeterTrack } from './meter-track';

describe('NgpMeterTrack', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpMeterTrack></div>`, {
      imports: [NgpMeterTrack],
    });
  });
});
