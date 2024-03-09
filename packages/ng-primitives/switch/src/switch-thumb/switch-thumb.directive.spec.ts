import { render } from '@testing-library/angular';
import { NgpSwitchThumbDirective } from './switch-thumb.directive';

describe('NgpSwitchThumbDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSwitchThumb></div>`, {
      imports: [NgpSwitchThumbDirective],
    });
  });
});
