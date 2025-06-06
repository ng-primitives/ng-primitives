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
      display: block;
      width: 100%;
      max-width: 24rem;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
    }
  `,
})
export class Accordion {}
