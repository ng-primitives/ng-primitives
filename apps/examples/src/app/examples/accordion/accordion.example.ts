import { Component } from '@angular/core';
import {
  NgpAccordionContentDirective,
  NgpAccordionDirective,
  NgpAccordionItemDirective,
  NgpAccordionTriggerDirective,
} from '@ng-primitives/ng-primitives/accordion';

@Component({
  standalone: true,
  selector: 'app-accordion',
  imports: [
    NgpAccordionDirective,
    NgpAccordionItemDirective,
    NgpAccordionContentDirective,
    NgpAccordionTriggerDirective,
  ],
  template: `<div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
    <div ngpAccordionItem ngpAccordionItemValue="item-1">
      <div ngpAccordionTrigger>Is it accessible?</div>
      <div ngpAccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</div>
    </div>

    <div ngpAccordionItem ngpAccordionItemValue="item-2">
      <div ngpAccordionTrigger>Is it unstyled?</div>
      <div ngpAccordionContent>
        Yes. It's unstyled by default, giving you freedom over the look and feel.
      </div>
    </div>

    <div ngpAccordionItem ngpAccordionItemValue="item-3">
      <div ngpAccordionTrigger>Can it be animated?</div>
      <div ngpAccordionContent>Yes! You can animate the Accordion with CSS or JavaScript.</div>
    </div>
  </div>`,
})
export default class AccordionExample {}
