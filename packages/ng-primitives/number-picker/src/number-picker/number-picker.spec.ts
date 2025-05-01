import { render } from '@testing-library/angular';
import { NgpNumberPicker } from './number-picker';

describe('NgpNumberPicker', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpNumberPicker></div>`, {
      imports: [NgpNumberPicker],
    });
  });
});
