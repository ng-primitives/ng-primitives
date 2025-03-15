import { Component } from '@angular/core';
import { NgpAccordion } from 'ng-primitives/accordion';

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
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }
  `,
})
export class Accordion {}
