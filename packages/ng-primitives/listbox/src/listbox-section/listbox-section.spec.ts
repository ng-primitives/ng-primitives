import { render } from '@testing-library/angular';
import { NgpListboxSection } from './listbox-section';

describe('NgpListboxSection', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpListboxSection></div>`, {
      imports: [NgpListboxSection],
    });
  });
});
