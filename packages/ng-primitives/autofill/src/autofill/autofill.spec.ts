import { render } from '@testing-library/angular';
import { NgpAutofill } from './autofill';

describe('NgpAutofill', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAutofill></div>`, {
      imports: [NgpAutofill],
    });
  });
});
