import { render } from '@testing-library/angular';
import { NgpAccordionTriggerDirective } from './accordion-trigger.directive';

describe('NgpAccordionTriggerDirective', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpAccordionTrigger></div>`, {
      imports: [NgpAccordionTriggerDirective],
    });
  });
});
