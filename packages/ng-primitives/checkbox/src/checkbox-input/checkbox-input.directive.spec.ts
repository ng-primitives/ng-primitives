import { render } from '@testing-library/angular';
import { NgpCheckboxInputDirective } from './checkbox-input.directive';

describe('NgpCheckboxInputDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCheckboxInput></div>`, {
      imports: [NgpCheckboxInputDirective],
    });
  });
});
