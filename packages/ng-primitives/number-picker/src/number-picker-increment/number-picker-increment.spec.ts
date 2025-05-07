import { render } from '@testing-library/angular';
import { NgpNumberPickerIncrement } from './number-picker-increment';

describe('NgpNumberPickerIncrement', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpNumberPickerIncrement></div>`, {
      imports: [NgpNumberPickerIncrement],
    });
  });
});
