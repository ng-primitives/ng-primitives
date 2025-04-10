import { render } from '@testing-library/angular';
import { NgpDatePicker } from './date-picker';

describe('NgpDatePicker', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpDatePicker></div>`, {
      imports: [NgpDatePicker],
    });
  });
});
