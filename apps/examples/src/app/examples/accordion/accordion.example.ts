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
    class="w-full max-w-96 rounded-xl bg-neutral-100 p-2"
    ngpAccordion
    ngpAccordionType="single"
    ngpAccordionCollapsible
  >
    <div #panel1="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-1">
      <button
        class="flex w-full items-center justify-between rounded-md border bg-white p-2 text-sm text-neutral-950 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100"
        ngpAccordionTrigger
      >
        Would you like to learn more?

        <ng-icon
          class="transform text-xl text-neutral-500"
          [class.rotate-180]="panel1.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="px-2 pt-2 text-sm text-neutral-700" ngpAccordionContent>
        If you would like to learn more please reach out to us on GitHub.
      </div>
    </div>

    <div class="mt-2" #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
      <button
        class="flex w-full items-center justify-between rounded-md border bg-white p-2 text-sm text-neutral-950 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100"
        ngpAccordionTrigger
      >
        Can I use this in my project?

        <ng-icon
          class="transform text-xl text-neutral-500"
          [class.rotate-180]="panel2.open()"
          name="heroChevronDownMini"
        />
      </button>
      <div class="px-2 pt-2 text-sm text-neutral-700" ngpAccordionContent>
        Yes, this is open source and you can use it in your project.
      </div>
    </div>
  </div>`,
})
export default class AccordionExample {}
