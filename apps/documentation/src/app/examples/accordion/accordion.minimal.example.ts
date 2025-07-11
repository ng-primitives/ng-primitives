import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import {
  NgpAccordion,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-accordion-minimal',
  imports: [NgpButton, NgpAccordion, NgpAccordionItem, NgpAccordionContent, NgpAccordionTrigger],
  providers: [provideIcons({ heroChevronDownMini })],
  styles: `
    [ngpAccordionContent] {
      overflow: hidden;
    }

    [ngpAccordionContent][data-open] {
      height: var(--ngp-accordion-content-height);
    }

    [ngpAccordionContent][data-closed] {
      height: 0;
    }
  `,
  template: `
    <div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
      <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
        <button ngpAccordionTrigger ngpButton>Would you like to learn more?</button>
        <div ngpAccordionContent>
          <div class="accordion-content">
            If you would like to learn more please reach out to us on GitHub.
          </div>
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button ngpAccordionTrigger ngpButton>Can I use this in my project?</button>
        <div ngpAccordionContent>
          <div class="accordion-content">
            Yes, this is open source and you can use it in your project.
          </div>
        </div>
      </div>
    </div>
  `,
})
export default class AccordionExample {}
