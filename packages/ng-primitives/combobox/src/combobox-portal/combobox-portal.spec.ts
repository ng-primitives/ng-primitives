import { render } from '@testing-library/angular';
import { NgpComboboxPortal } from './combobox-portal';

describe('NgpComboboxPortal', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpComboboxPortal></div>`, {
      imports: [NgpComboboxPortal],
    });
  });
});
