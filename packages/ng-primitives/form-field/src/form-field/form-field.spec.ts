import { render } from '@testing-library/angular';
import { NgpFormField } from './form-field';

describe('NgpFormField', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpFormField></div>`, {
      imports: [NgpFormField],
    });
  });
});
