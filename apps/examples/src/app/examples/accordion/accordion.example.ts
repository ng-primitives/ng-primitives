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
    class="w-full max-w-md rounded-2xl bg-white p-2"
    ngpAccordion
    ngpAccordionType="single"
    ngpAccordionCollapsible
  >
    <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
      <button
        class="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
        ngpAccordionTrigger
      >
        What is your refund policy?

        <ng-icon
          class="transform text-xl text-purple-500"
          [class.rotate-180]="panel1.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="px-4 pb-2 pt-4 text-sm text-gray-500" ngpAccordionContent>
        If you're unhappy with your purchase for any reason, email us within 90 days and we'll
        refund you in full, no questions asked.
      </div>
    </div>

    <div class="mt-2" #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
      <button
        class="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
        ngpAccordionTrigger
      >
        Do you offer technical support?

        <ng-icon
          class="transform text-xl text-purple-500"
          [class.rotate-180]="panel2.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="px-4 pb-2 pt-4 text-sm text-gray-500" ngpAccordionContent>No.</div>
    </div>
  </div>`,
})
export default class AccordionExample {}
