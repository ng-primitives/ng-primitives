import { render } from '@testing-library/angular';
import { NgpAccordionItemDirective } from './accordion-item.directive';

describe('NgpAccordionItemDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAccordionItem></div>`, {
      imports: [NgpAccordionItemDirective],
    });
  });
});
