import { render } from '@testing-library/angular';
import { NgpComboboxInput } from './combobox-input';

describe('NgpComboboxInput', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpComboboxInput></div>`, {
      imports: [NgpComboboxInput],
    });
  });
});
