import { render } from '@testing-library/angular';
import { NgpCombobox } from './combobox';

describe('NgpCombobox', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCombobox></div>`, {
      imports: [NgpCombobox],
    });
  });
});
