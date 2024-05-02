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
  template: `
    <div
      class="w-full max-w-96 rounded-xl border border-zinc-200 bg-white shadow-sm"
      ngpAccordion
      ngpAccordionType="single"
      ngpAccordionCollapsible
    >
      <div
        class="border-b border-zinc-200"
        #panel1="ngpAccordionItem"
        ngpAccordionItem
        ngpAccordionItemValue="item-1"
      >
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl px-4 text-sm font-medium text-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          ngpAccordionTrigger
        >
          Would you like to learn more?

          <ng-icon
            class="transform text-xl text-zinc-500"
            [class.rotate-180]="panel1.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div class="px-4 pb-3 text-sm text-zinc-500" ngpAccordionContent>
          If you would like to learn more please reach out to us on GitHub.
        </div>
      </div>

      <div #panel2="ngpAccordionItem" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button
          class="flex h-11 w-full items-center justify-between rounded-xl px-4 text-sm font-medium text-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          ngpAccordionTrigger
        >
          Can I use this in my project?

          <ng-icon
            class="transform text-xl text-zinc-500"
            [class.rotate-180]="panel2.open()"
            name="heroChevronDownMini"
          />
        </button>
        <div class="px-4 pb-3 text-sm text-zinc-500" ngpAccordionContent>
          Yes, this is open source and you can use it in your project.
        </div>
      </div>
    </div>
  `,
})
export default class AccordionExample {}
