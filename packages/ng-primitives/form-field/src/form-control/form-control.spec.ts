import { render } from '@testing-library/angular';
import { NgpFormControl } from './form-control';

describe('NgpFormControl', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpFormControl></div>`, {
      imports: [NgpFormControl],
    });
  });
});
