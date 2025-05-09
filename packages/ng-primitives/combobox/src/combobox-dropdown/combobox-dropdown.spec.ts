import { render } from '@testing-library/angular';
import { NgpComboboxDropdown } from './combobox-dropdown';

describe('NgpComboboxDropdown', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpComboboxDropdown></div>`, {
      imports: [NgpComboboxDropdown],
    });
  });
});
