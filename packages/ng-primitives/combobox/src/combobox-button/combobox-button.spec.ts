import { render } from '@testing-library/angular';
import { NgpComboboxButton } from './combobox-button';

describe('NgpComboboxButton', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpComboboxButton></div>`, {
      imports: [NgpComboboxButton],
    });
  });
});
