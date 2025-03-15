import { Component } from '@angular/core';
import { AccordionItem } from './accordion-item.ng';
import { Accordion } from './accordion.ng';

@Component({
  selector: 'app-accordion-example',
  imports: [Accordion, AccordionItem],
  template: `
    <app-accordion>
      <app-accordion-item heading="Accordion 1" value="accordion-item-1">
        <p>Accordion item 1</p>
      </app-accordion-item>
      <app-accordion-item heading="Accordion 2" value="accordion-item-2">
        <p>Accordion item 2</p>
      </app-accordion-item>
      <app-accordion-item heading="Accordion 3" value="accordion-item-3">
        <p>Accordion item 3</p>
      </app-accordion-item>
    </app-accordion>
  `,
})
export default class App {}
