import { render } from '@testing-library/angular';
import { NgpDateRangePicker } from './date-range-picker';

describe('NgpDateRangePicker', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpDateRangePicker></div>`, {
      imports: [NgpDateRangePicker],
    });
  });
});
