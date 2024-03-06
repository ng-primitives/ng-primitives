import { render } from '@testing-library/angular';
import { NgpCheckboxLabelDirective } from './checkbox-label.directive';

describe('NgpCheckboxLabelDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpCheckboxLabel></div>`, {
      imports: [NgpCheckboxLabelDirective],
    });
  });
});
