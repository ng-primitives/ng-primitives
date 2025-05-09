import { render } from '@testing-library/angular';
import { NgpComboboxOption } from './combobox-option';

describe('NgpComboboxOption', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpComboboxOption></div>`, {
      imports: [NgpComboboxOption],
    });
  });
});
