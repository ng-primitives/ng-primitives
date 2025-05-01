import { render } from '@testing-library/angular';
import { NgpNumberPickerInput } from './number-picker-input';

describe('NgpNumberPickerInput', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpNumberPickerInput></div>`, {
      imports: [NgpNumberPickerInput],
    });
  });
});
