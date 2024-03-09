import { render } from '@testing-library/angular';
import { NgpSwitchDirective } from './switch.directive';

describe('NgpSwitchDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpSwitch></div>`, {
      imports: [NgpSwitchDirective],
    });
  });
});
