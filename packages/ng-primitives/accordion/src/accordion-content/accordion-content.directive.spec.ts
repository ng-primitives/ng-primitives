import { render } from '@testing-library/angular';
import { NgpAccordionContentDirective } from './accordion-content.directive';

describe('NgpAccordionContentDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAccordionContent></div>`, {
      imports: [NgpAccordionContentDirective],
    });
  });
});
