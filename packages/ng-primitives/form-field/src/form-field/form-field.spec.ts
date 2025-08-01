import { render } from '@testing-library/angular';
import { NgpFormField } from './form-field';

describe('NgpFormField', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpFormField></div>`, {
      imports: [NgpFormField],
    });
  });
});
