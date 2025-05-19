import { render } from '@testing-library/angular';
import { NgpNumberPickerDecrement } from './number-picker-decrement';

describe('NgpNumberPickerDecrement', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpNumberPickerDecrement></div>`, {
      imports: [NgpNumberPickerDecrement],
    });
  });
});
