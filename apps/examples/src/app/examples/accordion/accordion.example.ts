import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
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
    NgIcon,
    NgpAccordionDirective,
    NgpAccordionItemDirective,
    NgpAccordionContentDirective,
    NgpAccordionTriggerDirective,
  ],
  viewProviders: [provideIcons({ heroChevronDownMini })],
  host: {
    class: 'flex justify-center w-full',
  },
  template: `<div
    class="border-primary-300/20 w-full max-w-md rounded-2xl border bg-neutral-800 p-2 shadow-md"
    ngpAccordion
    ngpAccordionType="single"
    ngpAccordionCollapsible
  >
    <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
      <button
        class="text-primary-500 border-primary-300/20 hover:bg-primary-50/10 focus-visible:ring-primary-500/50 flex w-full justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium focus:outline-none focus-visible:ring"
        ngpAccordionTrigger
      >
        Would you like to learn more?

        <ng-icon
          class="text-primary-500 transform text-xl"
          [class.rotate-180]="panel1.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="text-primary-100 px-4 pb-2 pt-4 text-sm" ngpAccordionContent>
        If you would like to learn more please reach out to us on GitHub.
      </div>
    </div>

    <div class="mt-2" #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
      <button
        class="text-primary-500 border-primary-300/20 hover:bg-primary-50/10 focus-visible:ring-primary-500/50 flex w-full justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium focus:outline-none focus-visible:ring"
        ngpAccordionTrigger
      >
        Can I use this in my project?

        <ng-icon
          class="text-primary-500 transform text-xl"
          [class.rotate-180]="panel2.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="text-primary-100 px-4 pb-2 pt-4 text-sm" ngpAccordionContent>
        Yes, this is open source and you can use it in your project.
      </div>
    </div>
  </div>`,
})
export default class AccordionExample {}
