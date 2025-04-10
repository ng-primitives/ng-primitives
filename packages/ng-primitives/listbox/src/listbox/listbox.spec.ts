import { render } from '@testing-library/angular';
import { NgpListbox } from './listbox';

describe('NgpListbox', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpListbox></div>`, {
      imports: [NgpListbox],
    });
  });
});
