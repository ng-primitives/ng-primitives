import { render } from '@testing-library/angular';
import { NgpAccordionDirective } from './accordion.directive';

describe('NgpAccordionDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAccordion></div>`, {
      imports: [NgpAccordionDirective],
    });
  });
});
