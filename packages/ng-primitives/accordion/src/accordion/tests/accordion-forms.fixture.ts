import { Component, input } from '@angular/core';
import {
  NgpAccordion,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-accordion',
  hostDirectives: [
    {
      directive: NgpAccordion,
      inputs: [
        'ngpAccordionValue:value',
        'ngpAccordionType:type',
        'ngpAccordionCollapsible:collapsible',
        'ngpAccordionDisabled:disabled',
        'ngpAccordionOrientation:orientation',
      ],
    },
  ],
  template: `
    <ng-content />
  `,
})
export class AccordionFixture {}

@Component({
  selector: 'app-accordion-item',
  hostDirectives: [
    {
      directive: NgpAccordionItem,
      inputs: ['ngpAccordionItemValue:value', 'ngpAccordionItemDisabled:disabled'],
    },
  ],
  imports: [NgpAccordionContent, NgpAccordionTrigger, NgpButton],
  template: `
    <button ngpAccordionTrigger ngpButton>{{ heading() }}</button>
    <div ngpAccordionContent><ng-content /></div>
  `,
})
export class AccordionItemFixture {
  readonly heading = input.required<string>();
}
