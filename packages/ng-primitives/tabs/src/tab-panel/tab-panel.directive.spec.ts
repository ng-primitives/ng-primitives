import { render } from '@testing-library/angular';
import { NgpTabPanelDirective } from './tab-panel.directive';

describe('NgpTabPanelDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTabPanel></div>`, {
      imports: [NgpTabPanelDirective],
    });
  });
});
